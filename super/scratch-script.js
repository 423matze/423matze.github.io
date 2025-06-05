
// Interactive Scratch Image Script Version 3.1
// This script provides an interactive image display with quad subdivision.
// It allows users to explore images by subdividing them into smaller quads, revealing details on interaction.
// Optimized for touch devices with "scratch-to-reveal" functionality.

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
    // Mirroring logic from handleQuadInteraction for when a quad can be interacted with
    const canReveal = quad.depth === MAX_QUAD_DEPTH && !quad.isRevealed;
    const canSubdivide = quad.depth < MAX_QUAD_DEPTH && !quad.isDivided && !quad.isRevealed &&
                         quad.width / 2 >= MIN_QUAD_SIZE_CONFIG && quad.height / 2 >= MIN_QUAD_SIZE_CONFIG &&
                         quad.width >= 1 && quad.height >= 1;
    return canReveal || canSubdivide;
}

function handleQuadInteraction(quadId) {
  if (!originalImage || !topLevelQuads || isLoading) return;

  let quadChanged = false;
  const findAndProcessQuadRecursive = (quads, targetId) => {
    return quads.map(q => {
      if (q.id === targetId) {
        if (q.depth === MAX_QUAD_DEPTH && !q.isRevealed) {
          quadChanged = true;
          return { ...q, isRevealed: true, isDivided: false };
        }
        if (q.depth < MAX_QUAD_DEPTH && !q.isDivided && !q.isRevealed &&
            q.width / 2 >= MIN_QUAD_SIZE_CONFIG && q.height / 2 >= MIN_QUAD_SIZE_CONFIG &&
            q.width >= 1 && q.height >= 1) {
          quadChanged = true;
          return subdivideQuadLogic(q, originalImage.data, originalImage.width);
        }
        return q; // No change to this quad if conditions not met
      }
      if (q.isDivided && q.children) {
        const originalChildren = q.children;
        const newChildren = findAndProcessQuadRecursive(q.children, targetId);
        if (newChildren !== originalChildren) { // Check if children array instance changed
             return { ...q, children: newChildren };
        }
      }
      return q;
    });
  };
  
  const newTopLevelQuads = findAndProcessQuadRecursive(topLevelQuads, quadId);
  
  if (quadChanged) { // Only update and re-render if an actual subdivision or reveal happened
      topLevelQuads = newTopLevelQuads;
      renderQuadsDOM(); 
  }
}

// --- DOM Rendering Functions ---
function renderQuadsDOM() {
  if (!scratchImageDisplayEl || !topLevelQuads || !originalImage || !displayDimensions) {
    return; 
  }
  scratchImageDisplayEl.innerHTML = ''; 

  const renderRecursive = (quad) => {
    if (quad.isDivided && quad.children) {
      quad.children.forEach(child => renderRecursive(child));
      return;
    }

    const quadEl = document.createElement('div');
    quadEl.id = quad.id; // Set ID on the element for easier targeting
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
                if (topLevelQuads && originalImage) { 
                    renderQuadsDOM();
                }
            }
        }
    }
}

// --- Touch Event Handlers for Scratching Quads ---
function handleTouchStart(event) {
  if (!scratchImageDisplayEl.contains(event.target) || event.touches.length !== 1 || isLoading) {
    isActiveTouchInteraction = false;
    return;
  }

  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
  isActiveTouchInteraction = true;
  lastProcessedQuadIdDuringDrag = null;

  const touch = event.changedTouches[0];
  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
  if (targetElement) {
    const quadElement = targetElement.closest('[role="button"]'); // Quads have role="button" and an ID
    if (quadElement && quadElement.id && scratchImageDisplayEl.contains(quadElement)) {
      const quadId = quadElement.id;
      const quadData = findQuadDataById(topLevelQuads, quadId);
      if (quadData && isQuadInteractable(quadData)) {
         handleQuadInteraction(quadId);
         lastProcessedQuadIdDuringDrag = quadId;
      }
    }
  }
}

function handleTouchMove(event) {
  if (!isActiveTouchInteraction || event.touches.length !== 1 || isLoading) {
    return;
  }
  
  // Prevent default scroll/zoom behavior when scratching
  event.preventDefault();

  const touch = event.changedTouches[0];
  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

  if (targetElement) {
    const quadElement = targetElement.closest('[role="button"]');
    if (quadElement && quadElement.id && scratchImageDisplayEl.contains(quadElement)) {
      const quadId = quadElement.id;
      if (quadId !== lastProcessedQuadIdDuringDrag) {
        const quadData = findQuadDataById(topLevelQuads, quadId);
        if (quadData && isQuadInteractable(quadData)) {
          handleQuadInteraction(quadId);
          lastProcessedQuadIdDuringDrag = quadId;
        } else if (!quadData || !isQuadInteractable(quadData)){
          // If dragged onto a non-interactive part or a non-quad, reset to allow re-interaction with previous if dragged back
          lastProcessedQuadIdDuringDrag = null; 
        }
      }
    } else {
      // Dragged off a quad element onto the background of display area
      lastProcessedQuadIdDuringDrag = null;
    }
  } else {
    // Dragged outside the display area entirely
    lastProcessedQuadIdDuringDrag = null;
  }
}

function handleTouchEnd(event) {
  if (!isActiveTouchInteraction || event.changedTouches.length !== 1 || isLoading) {
    isActiveTouchInteraction = false; // Ensure reset
    return;
  }

  const touch = event.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // If it was a tap (minimal movement) and no quad was processed during a drag
  if (Math.abs(deltaX) < TAP_MOVEMENT_THRESHOLD && Math.abs(deltaY) < TAP_MOVEMENT_THRESHOLD) {
    // It's a tap. The initial touchstart might have handled it.
    // This ensures interaction if touchstart didn't (e.g., if it started on non-interactive part then tapped on interactive).
    // Or if it was a very quick tap where touchstart processing wasn't "enough".
    const targetElement = document.elementFromPoint(touchEndX, touchEndY);
    if (targetElement) {
      const quadElement = targetElement.closest('[role="button"]');
      if (quadElement && quadElement.id && scratchImageDisplayEl.contains(quadElement)) {
        const quadId = quadElement.id;
        // Check if this specific quad needs interaction, in case it wasn't the one processed by touchstart
        // or if its state could have changed by other means (unlikely in this setup).
        // handleQuadInteraction itself is idempotent for already processed states.
        const quadData = findQuadDataById(topLevelQuads, quadId);
        if (quadData && isQuadInteractable(quadData)) {
             handleQuadInteraction(quadId);
        }
      }
    }
  }
  // For drags, interaction is handled by handleTouchMove. No specific action here.

  isActiveTouchInteraction = false;
  lastProcessedQuadIdDuringDrag = null;
}

function handleTouchCancel(event) {
  isActiveTouchInteraction = false;
  lastProcessedQuadIdDuringDrag = null;
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
    scratchImageDisplayEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    scratchImageDisplayEl.addEventListener('touchmove', handleTouchMove, { passive: false }); 
    scratchImageDisplayEl.addEventListener('touchend', handleTouchEnd);
    scratchImageDisplayEl.addEventListener('touchcancel', handleTouchCancel);
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
