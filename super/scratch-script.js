
// Interactive Scratch Image Script Version 4.3 - debug 4
// This script provides an interactive image display with quad subdivision.
// It allows users to explore images by subdividing them into smaller quads, revealing details on interaction.
// Optimized for touch devices with "scratch-to-reveal" functionality using geometry-based touch detection.
// Includes rAF throttling for touchmove and extensive logging for debugging.

// --- Configuration Constants ---
const TARGET_IMAGE_WIDTH = 1280;
const TARGET_IMAGE_HEIGHT = 720;
const INITIAL_GRID_COLS = 5;
const INITIAL_GRID_ROWS = 3;
const INITIAL_QUAD_WIDTH = TARGET_IMAGE_WIDTH / INITIAL_GRID_COLS;
const INITIAL_QUAD_HEIGHT = TARGET_IMAGE_HEIGHT / INITIAL_GRID_ROWS;
const MAX_QUAD_DEPTH = 6;
const MIN_QUAD_SIZE_CONFIG = 2;
const TAP_MOVEMENT_THRESHOLD = 10; // Minimum pixels to differentiate a tap from a drag

// --- Application State ---
let imageUrls = [];
let currentImageIndex = 0;
let isLoading = true;
let error = null;
let quadBorderRadius = 0;
let topLevelQuads = null; // Array of QuadData objects
let originalImage = null; // { element, data, width, height }
let displayDimensions = null; // { width, height }

// --- DOM Element References ---
let scratchImageDisplayEl, imageControlsContainerEl, prevImageBtnEl, nextImageBtnEl, imageInfoEl, borderRadiusSliderEl, borderRadiusLabelEl;

// --- Touch Interaction State ---
let touchStartX = 0;
let touchStartY = 0;
let isActiveTouchInteraction = false;
let lastProcessedQuadIdDuringDrag = null;
let touchMoveScheduledFrame = false;
let lastTouchEventForRAF = null;


// --- Utility Functions ---
function getAverageColor(sourceImageData, sourceImageWidth, regionX, regionY, regionWidth, regionHeight) {
  let r = 0, g = 0, b = 0;
  let count = 0;
  const startX = Math.max(0, Math.floor(regionX));
  const startY = Math.max(0, Math.floor(regionY));
  const endX = Math.min(sourceImageWidth, Math.floor(regionX + regionWidth));
  const endY = Math.min(sourceImageData.height, Math.floor(regionY + regionHeight));

  for (let iy = startY; iy < endY; iy++) {
    for (let ix = startX; ix < endX; ix++) {
      const pixelStartIndex = (iy * sourceImageWidth + ix) * 4;
      if (pixelStartIndex + 3 < sourceImageData.data.length) {
        r += sourceImageData.data[pixelStartIndex];
        g += sourceImageData.data[pixelStartIndex + 1];
        b += sourceImageData.data[pixelStartIndex + 2];
        count++;
      }
    }
  }
  return count === 0 ? { r: 0, g: 0, b: 0 } : {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

function subdivideQuadLogic(quadToDivide, imgData, imgWidth) {
  const childWidth = quadToDivide.width / 2;
  const childHeight = quadToDivide.height / 2;

  if (childWidth < 0.5 || childHeight < 0.5) {
    return { ...quadToDivide, isDivided: false };
  }

  return {
    ...quadToDivide,
    isDivided: true,
    children: [
      { id: `${quadToDivide.id}-0`, x: quadToDivide.x, y: quadToDivide.y, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x, quadToDivide.y, childWidth, childHeight), isDivided: false, isRevealed: false },
      { id: `${quadToDivide.id}-1`, x: quadToDivide.x + childWidth, y: quadToDivide.y, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x + childWidth, quadToDivide.y, childWidth, childHeight), isDivided: false, isRevealed: false },
      { id: `${quadToDivide.id}-2`, x: quadToDivide.x, y: quadToDivide.y + childHeight, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x, quadToDivide.y + childHeight, childWidth, childHeight), isDivided: false, isRevealed: false },
      { id: `${quadToDivide.id}-3`, x: quadToDivide.x + childWidth, y: quadToDivide.y + childHeight, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x + childWidth, quadToDivide.y + childHeight, childWidth, childHeight), isDivided: false, isRevealed: false },
    ],
  };
}

// --- Core Application Logic ---
function loadImageAndSetupQuads(imageUrl) {
  isLoading = true;
  error = null;
  topLevelQuads = null;
  originalImage = null;
  renderApp(); 

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      error = `Image loaded with zero dimensions from ${imageUrl}.`;
      isLoading = false;
      renderApp();
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = TARGET_IMAGE_WIDTH;
    offscreenCanvas.height = TARGET_IMAGE_HEIGHT;
    const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      error = 'Could not get 2D context for image processing.';
      isLoading = false;
      renderApp();
      return;
    }

    const sourceAspectRatio = img.naturalWidth / img.naturalHeight;
    const targetAspectRatio = TARGET_IMAGE_WIDTH / TARGET_IMAGE_HEIGHT;
    let drawWidth = TARGET_IMAGE_WIDTH;
    let drawHeight = TARGET_IMAGE_HEIGHT;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.naturalWidth;
    let sourceHeight = img.naturalHeight;

    if (sourceAspectRatio > targetAspectRatio) {
      sourceWidth = img.naturalHeight * targetAspectRatio;
      sourceX = (img.naturalWidth - sourceWidth) / 2;
    } else if (sourceAspectRatio < targetAspectRatio) {
      sourceHeight = img.naturalWidth / targetAspectRatio;
      sourceY = (img.naturalHeight - sourceHeight) / 2;
    }

    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, drawWidth, drawHeight);
    const imageData = ctx.getImageData(0, 0, TARGET_IMAGE_WIDTH, TARGET_IMAGE_HEIGHT);
    
    originalImage = { 
      element: img, 
      data: imageData, 
      width: TARGET_IMAGE_WIDTH, 
      height: TARGET_IMAGE_HEIGHT 
    };
    
    const initialGrid = [];
    for (let r = 0; r < INITIAL_GRID_ROWS; r++) {
      for (let c = 0; c < INITIAL_GRID_COLS; c++) {
        const quadX = c * INITIAL_QUAD_WIDTH;
        const quadY = r * INITIAL_QUAD_HEIGHT;
        initialGrid.push({
          id: `quad-${r}-${c}`,
          x: quadX,
          y: quadY,
          width: INITIAL_QUAD_WIDTH,
          height: INITIAL_QUAD_HEIGHT,
          color: getAverageColor(imageData, TARGET_IMAGE_WIDTH, quadX, quadY, INITIAL_QUAD_WIDTH, INITIAL_QUAD_HEIGHT),
          depth: 0,
          isDivided: false,
          isRevealed: false,
        });
      }
    }
    topLevelQuads = initialGrid;
    isLoading = false;
    renderApp();
  };
  img.onerror = () => {
    error = `Failed to load image: ${imageUrl}. Check browser console.`;
    isLoading = false;
    renderApp();
  };
  img.src = imageUrl;
}

function findQuadDataById(quads, id) {
  if (!quads) return null;
  for (const quad of quads) {
    if (quad.id === id) return quad;
    if (quad.isDivided && quad.children) {
      const foundInChild = findQuadDataById(quad.children, id);
      if (foundInChild) return foundInChild;
    }
  }
  return null;
}

function isQuadInteractable(quad) {
    if (!quad) return false;
    const canReveal = quad.depth === MAX_QUAD_DEPTH && !quad.isRevealed;
    const canSubdivide = quad.depth < MAX_QUAD_DEPTH && !quad.isDivided && !quad.isRevealed &&
                         quad.width / 2 >= MIN_QUAD_SIZE_CONFIG && quad.height / 2 >= MIN_QUAD_SIZE_CONFIG &&
                         quad.width >= 1 && quad.height >= 1;
    return canReveal || canSubdivide;
}

function handleQuadInteraction(quadId) {
  // console.log('[Interaction] Attempting interaction for quadId:', quadId);
  if (!originalImage || !topLevelQuads || isLoading) {
    // console.log('[Interaction] Aborted: No original image, topLevelQuads, or is loading.');
    return;
  }

  let quadChanged = false;
  const findAndProcessQuadRecursive = (quads, targetId) => {
    return quads.map(q => {
      if (q.id === targetId) {
        if (q.depth === MAX_QUAD_DEPTH && !q.isRevealed) {
          // console.log('[Interaction] Revealing quad:', q.id);
          quadChanged = true;
          return { ...q, isRevealed: true, isDivided: false };
        }
        if (q.depth < MAX_QUAD_DEPTH && !q.isDivided && !q.isRevealed &&
            q.width / 2 >= MIN_QUAD_SIZE_CONFIG && q.height / 2 >= MIN_QUAD_SIZE_CONFIG &&
            q.width >= 1 && q.height >= 1) {
          // console.log('[Interaction] Subdividing quad:', q.id);
          quadChanged = true;
          return subdivideQuadLogic(q, originalImage.data, originalImage.width);
        }
        // console.log('[Interaction] Quad not interactable or already interacted:', q.id, q);
        return q; 
      }
      if (q.isDivided && q.children) {
        const originalChildren = q.children;
        const newChildren = findAndProcessQuadRecursive(q.children, targetId);
        if (newChildren !== originalChildren) { 
             return { ...q, children: newChildren };
        }
      }
      return q;
    });
  };
  
  const newTopLevelQuads = findAndProcessQuadRecursive(topLevelQuads, quadId);
  
  if (quadChanged) { 
      // console.log('[Interaction] Quad changed. Updating topLevelQuads and re-rendering.');
      topLevelQuads = newTopLevelQuads;
      renderQuadsDOM();
      if (scratchImageDisplayEl) void scratchImageDisplayEl.offsetHeight; // Force reflow
  } else {
      // console.log('[Interaction] No change to quad state for ID:', quadId);
  }
}

// --- DOM Rendering Functions ---
function renderQuadsDOM() {
  if (!scratchImageDisplayEl || !topLevelQuads || !originalImage || !displayDimensions) {
    // console.log('[RenderDOM] Aborted: Missing required elements for rendering quads.');
    return; 
  }
  // console.log('[RenderDOM] Clearing and re-rendering quads.');
  scratchImageDisplayEl.innerHTML = ''; 

  const renderRecursive = (quad) => {
    if (quad.isDivided && quad.children) {
      quad.children.forEach(child => renderRecursive(child));
      return;
    }

    const quadEl = document.createElement('div');
    quadEl.id = quad.id;
    quadEl.setAttribute('role', 'button');
    quadEl.setAttribute('tabindex', '0');
    quadEl.style.position = 'absolute';
    quadEl.style.boxSizing = 'border-box';
    quadEl.style.border = '1px solid rgba(255,255,255,0.05)';
    quadEl.style.overflow = 'hidden';
    quadEl.style.transition = 'border-radius 0.2s ease-out';

    const scaledX = (quad.x / TARGET_IMAGE_WIDTH) * displayDimensions.width;
    const scaledY = (quad.y / TARGET_IMAGE_HEIGHT) * displayDimensions.height;
    let scaledWidth = (quad.width / TARGET_IMAGE_WIDTH) * displayDimensions.width;
    let scaledHeight = (quad.height / TARGET_IMAGE_HEIGHT) * displayDimensions.height;
    scaledWidth = Math.max(0.5, scaledWidth); 
    scaledHeight = Math.max(0.5, scaledHeight);

    quadEl.style.left = `${scaledX}px`;
    quadEl.style.top = `${scaledY}px`;
    quadEl.style.width = `${scaledWidth}px`;
    quadEl.style.height = `${scaledHeight}px`;
    
    const interactable = isQuadInteractable(quad);
    quadEl.style.cursor = interactable ? 'pointer' : 'default';
     if (!interactable) quadEl.setAttribute('tabindex', '-1');


    let ariaLabel = `Image segment at depth ${quad.depth}.`;
    if (quad.isRevealed) {
        ariaLabel = `Image segment detail revealed (Depth ${quad.depth}).`;
    } else if (interactable && quad.depth === MAX_QUAD_DEPTH) {
        ariaLabel = `Reveal image detail for segment (Depth ${quad.depth}). Click, hover, focus, or tap.`;
    } else if (interactable) {
        ariaLabel = `Refine image segment (Depth ${quad.depth}). Click, hover, focus, or tap.`;
    } else {
        ariaLabel = `Image segment (Depth ${quad.depth}). Fully refined or too small.`;
    }
    quadEl.setAttribute('aria-label', ariaLabel);


    if (quad.isRevealed) {
      const bgPosX = -((quad.x / TARGET_IMAGE_WIDTH) * displayDimensions.width);
      const bgPosY = -((quad.y / TARGET_IMAGE_HEIGHT) * displayDimensions.height);
      quadEl.style.backgroundImage = `url(${originalImage.element.src})`;
      quadEl.style.backgroundSize = `${displayDimensions.width}px ${displayDimensions.height}px`;
      quadEl.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
      quadEl.style.borderRadius = '0%'; 
    } else {
      quadEl.style.backgroundColor = `rgb(${quad.color.r}, ${quad.color.g}, ${quad.color.b})`;
      quadEl.style.borderRadius = `${quadBorderRadius}%`;
    }

    if (interactable) {
      quadEl.addEventListener('click', () => handleQuadInteraction(quad.id));
      quadEl.addEventListener('mouseenter', () => handleQuadInteraction(quad.id));
      quadEl.addEventListener('focus', () => handleQuadInteraction(quad.id));
      quadEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleQuadInteraction(quad.id);
        }
      });
    }
    scratchImageDisplayEl.appendChild(quadEl);
  };

  topLevelQuads.forEach(quad => renderRecursive(quad));
}

function renderDisplayAreaContent() {
  if (!scratchImageDisplayEl) return;
  scratchImageDisplayEl.innerHTML = ''; 
  scratchImageDisplayEl.style.aspectRatio = `${TARGET_IMAGE_WIDTH} / ${TARGET_IMAGE_HEIGHT}`;
  scratchImageDisplayEl.style.maxWidth = `${TARGET_IMAGE_WIDTH}px`;

  if (isLoading && imageUrls.length > 0) {
    scratchImageDisplayEl.innerHTML = `
      <div class="status-message-container status-loading">
        <div class="spinner"></div>
        <p class="status-text">Loading Image...</p>
      </div>`;
  } else if (error && imageUrls.length > 0) {
    scratchImageDisplayEl.innerHTML = `
      <div class="status-message-container status-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="status-icon error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <h3 class="status-title">Oops! Image failed to load.</h3>
        <p class="status-text">${error}</p>
      </div>`;
  } else if (topLevelQuads && originalImage && displayDimensions) {
    renderQuadsDOM();
  } else if (imageUrls.length === 0 && !isLoading && !error) {
     scratchImageDisplayEl.parentElement.innerHTML = `
        <div class="no-content-message">
            <h1 class="no-content-title">Interactive Scratch Image</h1>
            <p class="no-content-text">No images configured. Please add image URLs to the 'image-sources' script tag in index.html.</p>
        </div>`;
  } else if (imageUrls.length === 0 && error && !isLoading) {
      scratchImageDisplayEl.parentElement.innerHTML = `
        <div class="no-content-message">
            <h1 class="no-content-title">Interactive Scratch Image</h1>
            <p class="no-content-text error-text">Error: ${error}</p>
        </div>`;
  }
}

function updateControlsUI() {
  if (!imageUrls || imageUrls.length === 0 || !imageControlsContainerEl) {
    if (imageControlsContainerEl) imageControlsContainerEl.style.display = 'none';
    return;
  }
  imageControlsContainerEl.style.display = 'flex';

  prevImageBtnEl.disabled = currentImageIndex === 0 || isLoading;
  nextImageBtnEl.disabled = currentImageIndex === imageUrls.length - 1 || isLoading;
  borderRadiusSliderEl.disabled = isLoading || !!error;

  if (isLoading) {
    imageInfoEl.textContent = "Loading...";
  } else if (error) {
    imageInfoEl.textContent = "Error";
  } else {
    imageInfoEl.textContent = `Image ${currentImageIndex + 1} of ${imageUrls.length}`;
  }
  borderRadiusLabelEl.textContent = `Corner Roundness: ${quadBorderRadius}%`;
  borderRadiusSliderEl.value = quadBorderRadius;
}

function renderApp() {
  updateControlsUI();
  renderDisplayAreaContent();
}

// --- Event Handlers & Initialization ---
function handlePrevImage() {
  if (isLoading || currentImageIndex <= 0) {
    return;
  }
  currentImageIndex--;
  loadImageAndSetupQuads(imageUrls[currentImageIndex]);
}

function handleNextImage() {
  if (isLoading || currentImageIndex >= imageUrls.length - 1) {
    return;
  }
  currentImageIndex++;
  loadImageAndSetupQuads(imageUrls[currentImageIndex]);
}

function handleBorderRadiusChange(event) {
  quadBorderRadius = parseInt(event.target.value, 10);
  renderApp(); 
}

function updateDisplayOnResize() {
    if (scratchImageDisplayEl) {
        const currentWidth = scratchImageDisplayEl.offsetWidth;
        const currentHeight = currentWidth / (TARGET_IMAGE_WIDTH / TARGET_IMAGE_HEIGHT); 
        if (currentWidth > 0 && currentHeight > 0) {
            if (!displayDimensions || displayDimensions.width !== currentWidth || displayDimensions.height !== currentHeight) {
                displayDimensions = { width: currentWidth, height: currentHeight };
                // console.log('[Resize] Display dimensions updated:', displayDimensions);
                if (topLevelQuads && originalImage) { 
                    renderQuadsDOM();
                }
            }
        }
    }
}

// --- Geometry-based Touch Interaction Helpers ---
function findDeepestQuadAtLogicalPoint(quads, logicalX, logicalY, _depthForLog = 0) {
  if (!quads) {
    // console.log(`[FindQuad @${_depthForLog}] No quads to check at this level.`);
    return null;
  }
  // console.log(`[FindQuad @${_depthForLog}] Searching at logicalX: ${logicalX.toFixed(2)}, logicalY: ${logicalY.toFixed(2)} among ${quads.length} quads.`);

  for (const quad of quads) {
    const qx = quad.x;
    const qy = quad.y;
    const qw = quad.width;
    const qh = quad.height;

    // console.log(`[FindQuad @${_depthForLog}] Checking quad: ${quad.id} (X:${qx.toFixed(0)}-${(qx+qw).toFixed(0)}, Y:${qy.toFixed(0)}-${(qy+qh).toFixed(0)})`);
    if (logicalX >= qx && logicalX < qx + qw && logicalY >= qy && logicalY < qy + qh) {
      // console.log(`[FindQuad @${_depthForLog}] Point is within quad: ${quad.id}`);
      if (quad.isDivided && quad.children && quad.children.length > 0) {
        // console.log(`[FindQuad @${_depthForLog}] Quad ${quad.id} is divided, searching children.`);
        const deeperMatch = findDeepestQuadAtLogicalPoint(quad.children, logicalX, logicalY, _depthForLog + 1);
        if (deeperMatch) {
          // console.log(`[FindQuad @${_depthForLog}] Deeper match found in children of ${quad.id}: ${deeperMatch.id}`);
          return deeperMatch; 
        }
        // console.log(`[FindQuad @${_depthForLog}] No deeper match in children of ${quad.id}, returning current quad.`);
      }
      // console.log(`[FindQuad @${_depthForLog}] Match found: ${quad.id}. Not divided or no deeper match.`);
      return quad; 
    }
  }
  // console.log(`[FindQuad @${_depthForLog}] Point not in any quad at this level.`);
  return null; 
}

function getQuadUnderTouch(touchEventClientX, touchEventClientY) {
  // console.log('[GetQuad] Called with clientX:', touchEventClientX, 'clientY:', touchEventClientY);
  if (!scratchImageDisplayEl || !displayDimensions || displayDimensions.width === 0 || displayDimensions.height === 0 || !topLevelQuads) {
    // console.log('[GetQuad] Aborted: Missing display element, dimensions, or topLevelQuads.');
    return null;
  }

  const rect = scratchImageDisplayEl.getBoundingClientRect();
  // console.log('[GetQuad] DisplayEl rect:', rect);
  const relativeX = touchEventClientX - rect.left;
  const relativeY = touchEventClientY - rect.top;
  // console.log('[GetQuad] Relative Coords: X:', relativeX, 'Y:', relativeY);

  if (relativeX < 0 || relativeX > displayDimensions.width || relativeY < 0 || relativeY > displayDimensions.height) {
    // console.log('[GetQuad] Touch is outside calculated display dimensions.');
    return null;
  }
  
  const logicalX = (relativeX / displayDimensions.width) * TARGET_IMAGE_WIDTH;
  const logicalY = (relativeY / displayDimensions.height) * TARGET_IMAGE_HEIGHT;
  // console.log('[GetQuad] Logical Coords: X:', logicalX, 'Y:', logicalY);

  const foundQuad = findDeepestQuadAtLogicalPoint(topLevelQuads, logicalX, logicalY);
  // if (foundQuad) {
  //   console.log('[GetQuad] Found quad data:', foundQuad.id);
  // } else {
  //   console.log('[GetQuad] No quad found at logical coordinates.');
  // }
  return foundQuad;
}


// --- Touch Event Handlers for Scratching Quads (Geometry-based with rAF) ---
function handleTouchStart(event) {
  console.log('[TouchStart] Event:', event);
  if (event.touches.length !== 1 || isLoading || !scratchImageDisplayEl) {
    isActiveTouchInteraction = false;
    console.log('[TouchStart] Aborted: Invalid touch count, loading, or no display element.');
    return;
  }

  let targetElement = event.target;
  let isTouchOnInteractiveArea = false;
  while (targetElement && targetElement !== document.body) {
    if (targetElement === scratchImageDisplayEl) {
      isTouchOnInteractiveArea = true;
      break;
    }
    targetElement = targetElement.parentElement;
  }

  if (!isTouchOnInteractiveArea) {
    isActiveTouchInteraction = false;
    console.log('[TouchStart] Touch did not originate on the interactive display area.');
    return;
  }
  console.log('[TouchStart] Touch originated on the interactive display area.');

  // We are sure the touch is on our component. Take control.
  event.preventDefault();
  console.log('[TouchStart] Successfully called event.preventDefault().');

  isActiveTouchInteraction = true;
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  lastProcessedQuadIdDuringDrag = null;
  // console.log('[TouchStart] Interaction ACTIVE. StartX:', touchStartX, 'StartY:', touchStartY);

  const quadData = getQuadUnderTouch(touch.clientX, touch.clientY);
  if (quadData && isQuadInteractable(quadData)) {
    // console.log('[TouchStart] Quad interactable at start:', quadData.id);
    handleQuadInteraction(quadData.id);
    lastProcessedQuadIdDuringDrag = quadData.id;
  } // else if (quadData) {
    // console.log('[TouchStart] Quad found but not interactable:', quadData.id);
  // } else {
    // console.log('[TouchStart] No quad found under initial touch.');
  // }
}

function processTouchMoveRAF() {
    if (!lastTouchEventForRAF || !isActiveTouchInteraction || isLoading) {
        touchMoveScheduledFrame = false;
        lastTouchEventForRAF = null; // Clear if no longer active
        // console.log('[ProcessTouchMoveRAF] Aborted or no longer active.');
        return;
    }

    const touch = lastTouchEventForRAF.changedTouches[0];
    // console.log('[ProcessTouchMoveRAF] Processing touch at clientX:', touch.clientX, 'clientY:', touch.clientY);

    const quadData = getQuadUnderTouch(touch.clientX, touch.clientY);

    if (quadData && isQuadInteractable(quadData)) {
        // console.log('[ProcessTouchMoveRAF] Interactable quad found:', quadData.id);
        handleQuadInteraction(quadData.id);
        lastProcessedQuadIdDuringDrag = quadData.id;
    } else if (quadData) {
        // console.log('[ProcessTouchMoveRAF] Quad found but not interactable:', quadData.id);
        lastProcessedQuadIdDuringDrag = quadData.id; // Still update for context
    } else {
        // console.log('[ProcessTouchMoveRAF] No quad found under touch.');
        lastProcessedQuadIdDuringDrag = null;
    }
    
    lastTouchEventForRAF = null; // Clear the event after processing
    touchMoveScheduledFrame = false; // Allow new frame to be scheduled
}

function handleTouchMove(event) {
  console.log('[TouchMove] Raw event:', event); // Critical log
  if (!isActiveTouchInteraction || event.touches.length !== 1 || isLoading) {
    // console.log('[TouchMove] Aborted: Not active, invalid touch count, or loading. isActive:', isActiveTouchInteraction, 'touches:', event.touches.length, 'isLoading:', isLoading);
    return;
  }
  
  // console.log('[TouchMove] Preventing default browser action (already called in touchstart usually for active gestures, but can be here too).');
  event.preventDefault(); // Keep this here as well for good measure if touchstart's preventDefault was somehow missed or overridden

  lastTouchEventForRAF = event; // Store the latest event

  if (!touchMoveScheduledFrame) {
    touchMoveScheduledFrame = true;
    // console.log('[TouchMove] Scheduling RAF for processing.');
    requestAnimationFrame(processTouchMoveRAF);
  } else {
    // console.log('[TouchMove] RAF already scheduled, event updated.');
  }
}

function handleTouchEnd(event) {
  console.log('[TouchEnd] Event:', event); // Critical log
  if (!isActiveTouchInteraction || event.changedTouches.length !== 1 || isLoading) {
    isActiveTouchInteraction = false; 
    // console.log('[TouchEnd] Aborted: Not active, invalid touch count, or loading.');
    return;
  }

  const touch = event.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  // console.log('[TouchEnd] Touch ended at clientX:', touchEndX, 'clientY:', touchEndY);

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) < TAP_MOVEMENT_THRESHOLD && Math.abs(deltaY) < TAP_MOVEMENT_THRESHOLD) {
    // console.log('[TouchEnd] Detected as TAP. DeltaX:', deltaX, 'DeltaY:', deltaY);
    const quadData = getQuadUnderTouch(touchEndX, touchEndY);
    if (quadData && isQuadInteractable(quadData)) {
      // console.log('[TouchEnd] TAP: Interactable quad found:', quadData.id);
      handleQuadInteraction(quadData.id);
    } // else if (quadData) {
      // console.log('[TouchEnd] TAP: Quad found but not interactable:', quadData.id);
    // } else {
      // console.log('[TouchEnd] TAP: No quad found under touch.');
    // }
  } // else {
    // console.log('[TouchEnd] Detected as DRAG/SWIPE. Interaction handled by TouchMove (RAF). DeltaX:', deltaX, 'DeltaY:', deltaY);
  // }

  isActiveTouchInteraction = false;
  lastProcessedQuadIdDuringDrag = null;
  lastTouchEventForRAF = null; // Clear any pending RAF event on touch end
  touchMoveScheduledFrame = false;
  // console.log('[TouchEnd] Interaction INACTIVE.');
}

function handleTouchCancel(event) {
  console.log('[TouchCancel] Event:', event); // Critical log
  isActiveTouchInteraction = false;
  lastProcessedQuadIdDuringDrag = null;
  lastTouchEventForRAF = null;
  touchMoveScheduledFrame = false;
  // console.log('[TouchCancel] Interaction INACTIVE.');
}


function initApp() {
  scratchImageDisplayEl = document.getElementById('scratch-image-display');
  imageControlsContainerEl = document.getElementById('image-controls-container');
  prevImageBtnEl = document.getElementById('prev-image-btn');
  nextImageBtnEl = document.getElementById('next-image-btn');
  imageInfoEl = document.getElementById('image-info');
  borderRadiusSliderEl = document.getElementById('border-radius-slider');
  borderRadiusLabelEl = document.getElementById('border-radius-label');

  const imageSourcesScriptTag = document.getElementById('image-sources');
  if (imageSourcesScriptTag?.textContent) {
    try {
      const parsedUrls = JSON.parse(imageSourcesScriptTag.textContent);
      if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
        imageUrls = parsedUrls;
      } else {
        error = "Parsed image sources is not a non-empty array or is empty.";
      }
    } catch (e) {
      console.error("Failed to parse image sources from HTML:", e);
      error = "Could not load image list. Check JSON in 'image-sources' script tag.";
    }
  } else {
    error = "Image sources script tag not found or empty.";
  }
  
  isLoading = false; 

  prevImageBtnEl.addEventListener('click', handlePrevImage);
  nextImageBtnEl.addEventListener('click', handleNextImage);
  borderRadiusSliderEl.addEventListener('input', handleBorderRadiusChange);

  if (scratchImageDisplayEl) {
    scratchImageDisplayEl.addEventListener('touchstart', handleTouchStart, { passive: false }); 
    scratchImageDisplayEl.addEventListener('touchmove', handleTouchMove, { passive: false }); 
    scratchImageDisplayEl.addEventListener('touchend', handleTouchEnd); // passive: true (default) is fine for end/cancel
    scratchImageDisplayEl.addEventListener('touchcancel', handleTouchCancel); // passive: true (default) is fine for end/cancel
  }

  const resizeObserver = new ResizeObserver(updateDisplayOnResize);
  if (scratchImageDisplayEl) {
      resizeObserver.observe(scratchImageDisplayEl);
  }
  
  if (imageUrls.length > 0) {
    loadImageAndSetupQuads(imageUrls[currentImageIndex]);
  } else {
      renderApp(); 
  }
  updateDisplayOnResize(); 
}

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initApp();
    });
  });
});
