
// Interactive Scratch Image Script Version 9.3 (Targeted DOM Updates)
// This script provides an interactive image display with quad subdivision.
// Implements "Area/Pencil Reveal" for touch and mouse interactions.
// Features rAF throttling, dedicated touch overlay, Initial CTA, and
// **PERFORMANCE OPTIMIZATION: Targeted DOM updates instead of full re-renders.**

// --- Configuration Constants ---
const TARGET_IMAGE_WIDTH = 1280;
const TARGET_IMAGE_HEIGHT = 720;
const INITIAL_GRID_COLS = 5;
const INITIAL_GRID_ROWS = 3;
const INITIAL_QUAD_WIDTH = TARGET_IMAGE_WIDTH / INITIAL_GRID_COLS;
const INITIAL_QUAD_HEIGHT = TARGET_IMAGE_HEIGHT / INITIAL_GRID_ROWS;
const MAX_QUAD_DEPTH = 6; // Max depth for subdivision
const MIN_QUAD_SIZE_CONFIG = 2; // Min quad dimension to allow further subdivision
const TAP_MOVEMENT_THRESHOLD = 10; // Pixels for tap vs drag
const PENCIL_REVEAL_RADIUS_LOGICAL = 25; // Radius for area reveal

// --- Application State ---
let imageUrls = [];
let currentImageIndex = 0;
let isLoading = true;
let error = null;
let quadBorderRadius = 0;
let topLevelQuads = null; // Array of root quad data objects
let originalImage = null; // { element, data, width, height }
let displayDimensions = null; // { width, height } of the display area
let isInitialCtaDismissed = false;

// --- DOM Element References ---
let scratchImageDisplayEl, imageControlsContainerEl, prevImageBtnEl, nextImageBtnEl, imageInfoEl, borderRadiusSliderEl, borderRadiusLabelEl, touchEventOverlayEl, initialCtaOverlayEl;

// --- Interaction State ---
let touchStartX = 0;
let touchStartY = 0;
let isActiveTouchInteraction = false;
let touchMoveScheduledFrame = false;
let lastTouchEventForRAF = null;
let mouseMoveScheduledFrame = false;
let lastMouseEventForRAF = null;
let isMouseInteractionActive = false;


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

// MODIFIED: Mutates the quadToDivide object
function subdivideQuadLogic(quadToDivide, imgData, imgWidth) {
    const childWidth = quadToDivide.width / 2;
    const childHeight = quadToDivide.height / 2;

    if (childWidth < 0.5 || childHeight < 0.5) {
        quadToDivide.isDivided = false; 
        return; 
    }

    quadToDivide.isDivided = true;
    quadToDivide.children = [
        { id: `${quadToDivide.id}-0`, x: quadToDivide.x, y: quadToDivide.y, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x, quadToDivide.y, childWidth, childHeight), isDivided: false, isRevealed: false, parentId: quadToDivide.id },
        { id: `${quadToDivide.id}-1`, x: quadToDivide.x + childWidth, y: quadToDivide.y, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x + childWidth, quadToDivide.y, childWidth, childHeight), isDivided: false, isRevealed: false, parentId: quadToDivide.id },
        { id: `${quadToDivide.id}-2`, x: quadToDivide.x, y: quadToDivide.y + childHeight, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x, quadToDivide.y + childHeight, childWidth, childHeight), isDivided: false, isRevealed: false, parentId: quadToDivide.id },
        { id: `${quadToDivide.id}-3`, x: quadToDivide.x + childWidth, y: quadToDivide.y + childHeight, width: childWidth, height: childHeight, depth: quadToDivide.depth + 1, color: getAverageColor(imgData, imgWidth, quadToDivide.x + childWidth, quadToDivide.y + childHeight, childWidth, childHeight), isDivided: false, isRevealed: false, parentId: quadToDivide.id },
    ];
}


// --- Core Application Logic ---
function loadImageAndSetupQuads(imageUrl) {
    isLoading = true;
    error = null;
    topLevelQuads = null;
    originalImage = null;
    isInitialCtaDismissed = false;
    if (initialCtaOverlayEl) {
        initialCtaOverlayEl.classList.remove('fade-out');
    }
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

function isQuadInteractable(quad) {
    if (!quad) return false;
    const canReveal = quad.depth === MAX_QUAD_DEPTH && !quad.isRevealed;
    const canSubdivide = quad.depth < MAX_QUAD_DEPTH && !quad.isDivided && !quad.isRevealed &&
                         quad.width / 2 >= MIN_QUAD_SIZE_CONFIG && quad.height / 2 >= MIN_QUAD_SIZE_CONFIG &&
                         quad.width >= 1 && quad.height >= 1;
    return canReveal || canSubdivide;
}

// --- DOM Rendering Functions ---

function renderSingleQuadElement(quadData) {
    if (!scratchImageDisplayEl || !originalImage || !displayDimensions) {
        return null;
    }

    const quadEl = document.createElement('div');
    quadEl.id = quadData.id;
    quadEl.setAttribute('role', 'button'); 
    quadEl.style.position = 'absolute';
    quadEl.style.boxSizing = 'border-box';
    quadEl.style.border = '1px solid rgba(255,255,255,0.05)';
    quadEl.style.overflow = 'hidden';
    quadEl.style.transition = 'border-radius 0.2s ease-out';

    const scaledX = (quadData.x / TARGET_IMAGE_WIDTH) * displayDimensions.width;
    const scaledY = (quadData.y / TARGET_IMAGE_HEIGHT) * displayDimensions.height;
    let scaledWidth = (quadData.width / TARGET_IMAGE_WIDTH) * displayDimensions.width;
    let scaledHeight = (quadData.height / TARGET_IMAGE_HEIGHT) * displayDimensions.height;
    scaledWidth = Math.max(0.5, scaledWidth); 
    scaledHeight = Math.max(0.5, scaledHeight);

    quadEl.style.left = `${scaledX}px`;
    quadEl.style.top = `${scaledY}px`;
    quadEl.style.width = `${scaledWidth}px`;
    quadEl.style.height = `${scaledHeight}px`;
    
    let ariaLabel = `Image segment at depth ${quadData.depth}.`;
    if (quadData.isRevealed) {
        ariaLabel = `Image segment detail revealed (Depth ${quadData.depth}).`;
    } else if (isQuadInteractable(quadData) && quadData.depth === MAX_QUAD_DEPTH) {
        ariaLabel = `Reveal image detail for segment (Depth ${quadData.depth}).`;
    } else if (isQuadInteractable(quadData)) {
        ariaLabel = `Refine image segment (Depth ${quadData.depth}).`;
    } else {
        ariaLabel = `Image segment (Depth ${quadData.depth}). Fully refined or too small.`;
    }
    quadEl.setAttribute('aria-label', ariaLabel);

    if (quadData.isRevealed) {
        const bgPosX = -((quadData.x / TARGET_IMAGE_WIDTH) * displayDimensions.width);
        const bgPosY = -((quadData.y / TARGET_IMAGE_HEIGHT) * displayDimensions.height);
        quadEl.style.backgroundImage = `url(${originalImage.element.src})`;
        quadEl.style.backgroundSize = `${displayDimensions.width}px ${displayDimensions.height}px`;
        quadEl.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
        quadEl.style.borderRadius = '0%';
    } else {
        quadEl.style.backgroundColor = `rgb(${quadData.color.r}, ${quadData.color.g}, ${quadData.color.b})`;
        quadEl.style.borderRadius = `${quadBorderRadius}%`;
    }

    scratchImageDisplayEl.appendChild(quadEl);
    return quadEl;
}

function initialFullRenderQuadsDOM() {
    if (!scratchImageDisplayEl || !topLevelQuads || !originalImage || !displayDimensions) {
        return;
    }
    
    Array.from(scratchImageDisplayEl.children).forEach(child => {
        if (child.id !== 'initial-cta-overlay' && child.getAttribute('role') === 'button') {
            scratchImageDisplayEl.removeChild(child);
        }
    });

    const renderRecursive = (quad) => {
        if (quad.isDivided && quad.children) {
            quad.children.forEach(child => renderRecursive(child));
            return;
        }
        renderSingleQuadElement(quad);
    };

    topLevelQuads.forEach(quad => renderRecursive(quad));
}

function renderDisplayAreaContent() {
    if (!scratchImageDisplayEl) return;

    scratchImageDisplayEl.style.aspectRatio = `${TARGET_IMAGE_WIDTH} / ${TARGET_IMAGE_HEIGHT}`;
    scratchImageDisplayEl.style.maxWidth = `${TARGET_IMAGE_WIDTH}px`;

    // Clear a dimension-specific error from previous render pass, it will be re-evaluated.
    if (error === "Display area has zero width or invalid dimensions. Cannot render image.") {
        error = null;
    }

    let contentRendered = false;

    if (isLoading && imageUrls.length > 0) {
        scratchImageDisplayEl.innerHTML = `
      <div class="status-message-container status-loading">
        <div class="spinner"></div>
        <p class="status-text">Loading Image...</p>
      </div>`;
        contentRendered = true;
    } else if (error && imageUrls.length > 0) { // Catches image load errors first
        scratchImageDisplayEl.innerHTML = `
      <div class="status-message-container status-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="status-icon error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <h3 class="status-title">Oops! Image Problem.</h3>
        <p class="status-text">${error}</p>
      </div>`;
        contentRendered = true;
    } else if (topLevelQuads && originalImage) { // Image data is loaded successfully
        if (displayDimensions && displayDimensions.width > 0 && displayDimensions.height > 0) {
            // All good, render quads
            scratchImageDisplayEl.innerHTML = ''; // Clear status messages
            if (initialCtaOverlayEl) {
                scratchImageDisplayEl.appendChild(initialCtaOverlayEl);
                if (!isInitialCtaDismissed) {
                    initialCtaOverlayEl.style.display = 'flex';
                    initialCtaOverlayEl.classList.remove('fade-out');
                } else {
                    initialCtaOverlayEl.style.display = 'none';
                }
            }
            initialFullRenderQuadsDOM();
        } else {
            // Image data is ready, but display area has no valid dimensions.
            const dimensionErrorMsg = "Display area has zero width or invalid dimensions. Cannot render image.";
            if (!error) { // Set this specific error only if no other critical error is already present
                error = dimensionErrorMsg;
            }
            // Display the current error (which might be the dimensionErrorMsg or a pre-existing one like image load failure)
            const messageToDisplay = error || dimensionErrorMsg; // Should prioritize the global error if set
            scratchImageDisplayEl.innerHTML = `
              <div class="status-message-container status-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="status-icon error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <h3 class="status-title">Display Issue</h3>
                <p class="status-text">${messageToDisplay}</p>
              </div>`;
        }
        contentRendered = true;
    } else if (imageUrls.length === 0 && !isLoading && !error) { // No images defined
        const parentContainer = scratchImageDisplayEl.parentElement;
        if (parentContainer) {
            parentContainer.innerHTML = `
            <div class="no-content-message">
                <h1 class="no-content-title">Interactive Scratch Image</h1>
                <p class="no-content-text">No images configured. Please add image URLs to the 'image-sources' script tag in index.html.</p>
            </div>`;
        }
        contentRendered = true;
    } else if (imageUrls.length === 0 && error && !isLoading) { // Error during init, like JSON parse
        const parentContainer = scratchImageDisplayEl.parentElement;
        if (parentContainer) {
            parentContainer.innerHTML = `
            <div class="no-content-message">
                <h1 class="no-content-title">Interactive Scratch Image</h1>
                <p class="no-content-text error-text">Error: ${error}</p>
            </div>`;
        }
        contentRendered = true;
    }

    if (!contentRendered && scratchImageDisplayEl.parentElement) {
         // Fallback: if no specific content was rendered in scratchImageDisplayEl,
         // ensure it's at least cleared or show a generic message if its parent is the target
        if (scratchImageDisplayEl.innerHTML.trim() !== '') scratchImageDisplayEl.innerHTML = '';
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
    if (isLoading || currentImageIndex <= 0) return;
    currentImageIndex--;
    loadImageAndSetupQuads(imageUrls[currentImageIndex]);
}

function handleNextImage() {
    if (isLoading || currentImageIndex >= imageUrls.length - 1) return;
    currentImageIndex++;
    loadImageAndSetupQuads(imageUrls[currentImageIndex]);
}

function handleBorderRadiusChange(event) {
    quadBorderRadius = parseInt(event.target.value, 10);
    if (topLevelQuads && !isLoading && !error && displayDimensions) {
        const updateRadiusRecursive = (quads) => {
            quads.forEach(q => {
                if (q.isDivided && q.children) {
                    updateRadiusRecursive(q.children);
                } else if (!q.isRevealed) {
                    const quadEl = document.getElementById(q.id);
                    if (quadEl) {
                        quadEl.style.borderRadius = `${quadBorderRadius}%`;
                    }
                }
            });
        };
        updateRadiusRecursive(topLevelQuads);
    }
    if (borderRadiusLabelEl) {
      borderRadiusLabelEl.textContent = `Corner Roundness: ${quadBorderRadius}%`;
    }
}

function updateDisplayOnResize() {
    if (!scratchImageDisplayEl) return;

    let dimensionsChangedStatus = false;

    const currentWidth = scratchImageDisplayEl.offsetWidth;
    // Protect against division by zero if constants are 0, default to 1:1 aspect ratio.
    const aspectRatio = (TARGET_IMAGE_WIDTH > 0 && TARGET_IMAGE_HEIGHT > 0) ? (TARGET_IMAGE_WIDTH / TARGET_IMAGE_HEIGHT) : 1;
    const currentHeight = Math.floor(currentWidth / aspectRatio); // Use Math.floor for integer pixel values

    if (currentWidth > 0 && currentHeight > 0) {
        // Valid dimensions obtained
        if (!displayDimensions || displayDimensions.width !== currentWidth || displayDimensions.height !== currentHeight) {
            displayDimensions = { width: currentWidth, height: currentHeight };
            dimensionsChangedStatus = true;
        }
    } else {
        // Invalid dimensions (e.g., width is 0)
        if (displayDimensions !== null) { // It previously had valid dimensions
            displayDimensions = null;
            dimensionsChangedStatus = true;
        }
    }

    if (dimensionsChangedStatus) {
        // console.log('[Resize] displayDimensions status changed or values updated, re-rendering. New Dims:', displayDimensions);
        renderApp(); // Let renderApp re-evaluate everything with new dimensions (or lack thereof)
    }
}


// --- Geometry-based Interaction Helpers ---
function rectangleIntersectsCircle(rectX, rectY, rectWidth, rectHeight, circleX, circleY, circleRadius) {
    const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circleRadius * circleRadius);
}

function interactWithQuadsInAreaRecursive(quadsToSearch, logicalCenterX, logicalCenterY, logicalRadius) {
    let anyChangeMade = false;
    if (!quadsToSearch || !originalImage || !displayDimensions) return false;

    for (let i = 0; i < quadsToSearch.length; i++) {
        const quad = quadsToSearch[i];

        if (rectangleIntersectsCircle(quad.x, quad.y, quad.width, quad.height, logicalCenterX, logicalCenterY, logicalRadius)) {
            if (quad.isDivided && quad.children && quad.children.length > 0) {
                if (interactWithQuadsInAreaRecursive(quad.children, logicalCenterX, logicalCenterY, logicalRadius)) {
                    anyChangeMade = true;
                }
            } else { 
                if (isQuadInteractable(quad)) {
                    const existingQuadEl = document.getElementById(quad.id);

                    if (quad.depth === MAX_QUAD_DEPTH && !quad.isRevealed) {
                        quad.isRevealed = true; 
                        if (existingQuadEl) { 
                            const bgPosX = -((quad.x / TARGET_IMAGE_WIDTH) * displayDimensions.width);
                            const bgPosY = -((quad.y / TARGET_IMAGE_HEIGHT) * displayDimensions.height);
                            existingQuadEl.style.backgroundImage = `url(${originalImage.element.src})`;
                            existingQuadEl.style.backgroundSize = `${displayDimensions.width}px ${displayDimensions.height}px`;
                            existingQuadEl.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
                            existingQuadEl.style.borderRadius = '0%';
                            existingQuadEl.style.backgroundColor = ''; 
                            existingQuadEl.setAttribute('aria-label', `Image segment detail revealed (Depth ${quad.depth}).`);
                        }
                        anyChangeMade = true;
                    } else if (quad.depth < MAX_QUAD_DEPTH && !quad.isDivided && !quad.isRevealed) {
                        subdivideQuadLogic(quad, originalImage.data, originalImage.width); 

                        if (existingQuadEl) { 
                            existingQuadEl.remove();
                        }
                        
                        if (quad.children && quad.children.length > 0) { 
                            quad.children.forEach(child => renderSingleQuadElement(child));
                        }
                        anyChangeMade = true;
                    }
                }
            }
        }
    }
    return anyChangeMade;
}


function getLogicalCoordinates(clientX, clientY) {
    if (!scratchImageDisplayEl || !displayDimensions || displayDimensions.width === 0 || displayDimensions.height === 0) {
        return null;
    }
    const rect = scratchImageDisplayEl.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const logicalX = (relativeX / displayDimensions.width) * TARGET_IMAGE_WIDTH;
    const logicalY = (relativeY / displayDimensions.height) * TARGET_IMAGE_HEIGHT;
    return { logicalX, logicalY };
}

// --- Touch Event Handlers ---
function dismissInitialCta() {
    if (!isInitialCtaDismissed && initialCtaOverlayEl) {
        isInitialCtaDismissed = true;
        initialCtaOverlayEl.classList.add('fade-out');
        const onTransitionEnd = () => {
            if (initialCtaOverlayEl.classList.contains('fade-out')) {
                initialCtaOverlayEl.style.display = 'none';
            }
            initialCtaOverlayEl.removeEventListener('transitionend', onTransitionEnd);
        };
        initialCtaOverlayEl.addEventListener('transitionend', onTransitionEnd);
        setTimeout(() => { 
            if (initialCtaOverlayEl.classList.contains('fade-out') && initialCtaOverlayEl.style.display !== 'none') {
                initialCtaOverlayEl.style.display = 'none';
                initialCtaOverlayEl.removeEventListener('transitionend', onTransitionEnd);
            }
        }, 350); 
    }
}

function handleTouchStart(event) {
    if (!isInitialCtaDismissed && initialCtaOverlayEl && initialCtaOverlayEl.style.display !== 'none') {
        dismissInitialCta();
    }
    if (event.touches.length !== 1 || isLoading || !scratchImageDisplayEl || !touchEventOverlayEl) {
        isActiveTouchInteraction = false; 
        return;
    }
    let targetElement = event.target;
    let isTouchOnInteractiveArea = false;
    while (targetElement && targetElement !== document.body) {
        if (targetElement === scratchImageDisplayEl) { isTouchOnInteractiveArea = true; break; }
        targetElement = targetElement.parentElement;
    }
    if (!isTouchOnInteractiveArea) { 
        isActiveTouchInteraction = false; 
        return; 
    }

    event.preventDefault();
    scratchImageDisplayEl.style.pointerEvents = 'none';
    void scratchImageDisplayEl.offsetHeight;

    isActiveTouchInteraction = true;
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    touchEventOverlayEl.style.display = 'block';
    touchEventOverlayEl.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
    touchEventOverlayEl.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });
    touchEventOverlayEl.addEventListener('touchcancel', handleTouchCancel, { capture: true, passive: true });

    requestAnimationFrame(() => { 
        if (!isActiveTouchInteraction) {
            return;
        }
        const coords = getLogicalCoordinates(touchStartX, touchStartY);
        if (coords && topLevelQuads) {
             interactWithQuadsInAreaRecursive(topLevelQuads, coords.logicalX, coords.logicalY, PENCIL_REVEAL_RADIUS_LOGICAL);
        }
    });
}

function processTouchMoveRAF() {
    if (!lastTouchEventForRAF || !isActiveTouchInteraction || isLoading || !topLevelQuads) {
        touchMoveScheduledFrame = false; lastTouchEventForRAF = null; return;
    }
    const touch = lastTouchEventForRAF.changedTouches[0];
    const coords = getLogicalCoordinates(touch.clientX, touch.clientY);
    if (coords) {
        interactWithQuadsInAreaRecursive(topLevelQuads, coords.logicalX, coords.logicalY, PENCIL_REVEAL_RADIUS_LOGICAL);
    }
    lastTouchEventForRAF = null; touchMoveScheduledFrame = false;
}

function handleTouchMove(event) {
    if (!isActiveTouchInteraction || event.touches.length !== 1 || isLoading) return;
    event.preventDefault(); event.stopPropagation();
    lastTouchEventForRAF = event;
    if (!touchMoveScheduledFrame) {
        touchMoveScheduledFrame = true; requestAnimationFrame(processTouchMoveRAF);
    }
}

function removeOverlayListenersAndHide() {
    if (touchEventOverlayEl) {
        touchEventOverlayEl.removeEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
        touchEventOverlayEl.removeEventListener('touchend', handleTouchEnd, { capture: true, passive: true });
        touchEventOverlayEl.removeEventListener('touchcancel', handleTouchCancel, { capture: true, passive: true });
        touchEventOverlayEl.style.display = 'none';
    }
    if (scratchImageDisplayEl) { 
        scratchImageDisplayEl.style.pointerEvents = 'auto';
    }
}

function handleTouchEnd(event) {
    if (!isActiveTouchInteraction) { 
        removeOverlayListenersAndHide(); return; 
    }
    isActiveTouchInteraction = false; lastTouchEventForRAF = null; touchMoveScheduledFrame = false;
    removeOverlayListenersAndHide();
}
function handleTouchCancel(event) {
    isActiveTouchInteraction = false; lastTouchEventForRAF = null; touchMoveScheduledFrame = false;
    removeOverlayListenersAndHide();
}

// --- Mouse Event Handlers for Area Reveal ---
function processMouseMoveRAF() {
    if (!lastMouseEventForRAF || !isMouseInteractionActive || isLoading || !topLevelQuads) {
        mouseMoveScheduledFrame = false; lastMouseEventForRAF = null; return;
    }
    const coords = getLogicalCoordinates(lastMouseEventForRAF.clientX, lastMouseEventForRAF.clientY);
    if (coords) {
        interactWithQuadsInAreaRecursive(topLevelQuads, coords.logicalX, coords.logicalY, PENCIL_REVEAL_RADIUS_LOGICAL);
    }
    lastMouseEventForRAF = null; mouseMoveScheduledFrame = false;
}

function handleMouseMove(event) {
    if (isLoading || !scratchImageDisplayEl || !isMouseInteractionActive) return;
    event.preventDefault();
    lastMouseEventForRAF = event;
    if (!mouseMoveScheduledFrame) {
        mouseMoveScheduledFrame = true; requestAnimationFrame(processMouseMoveRAF);
    }
}

function handleMouseDown(event) {
    if (event.button !== 0 || isLoading || !scratchImageDisplayEl) return; 
    
    if (!isInitialCtaDismissed && initialCtaOverlayEl && initialCtaOverlayEl.style.display !== 'none') {
        dismissInitialCta();
    }

    isMouseInteractionActive = true;
    
    const coords = getLogicalCoordinates(event.clientX, event.clientY);
    if (coords && topLevelQuads) {
         interactWithQuadsInAreaRecursive(topLevelQuads, coords.logicalX, coords.logicalY, PENCIL_REVEAL_RADIUS_LOGICAL);
    }
    window.addEventListener('mousemove', handleMouseMove, { capture: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });
}

function handleMouseUp(event) {
    if (event.button !== 0 || !isMouseInteractionActive) return;
    isMouseInteractionActive = false;
    lastMouseEventForRAF = null; mouseMoveScheduledFrame = false;
    window.removeEventListener('mousemove', handleMouseMove, { capture: true });
    window.removeEventListener('mouseup', handleMouseUp, { capture: true });
}

function handleMouseLeaveDisplay() { 
    // Intentionally left blank for now, mouseup on window handles drag-out better.
}

function initApp() {
    scratchImageDisplayEl = document.getElementById('scratch-image-display');
    imageControlsContainerEl = document.getElementById('image-controls-container');
    prevImageBtnEl = document.getElementById('prev-image-btn');
    nextImageBtnEl = document.getElementById('next-image-btn');
    imageInfoEl = document.getElementById('image-info');
    borderRadiusSliderEl = document.getElementById('border-radius-slider');
    borderRadiusLabelEl = document.getElementById('border-radius-label');
    touchEventOverlayEl = document.getElementById('touch-event-overlay');
    initialCtaOverlayEl = document.getElementById('initial-cta-overlay');

    const imageSourcesScriptTag = document.getElementById('image-sources');
    if (imageSourcesScriptTag?.textContent) {
        try {
            const parsedUrls = JSON.parse(imageSourcesScriptTag.textContent);
            if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
                imageUrls = parsedUrls;
            } else { error = "Parsed image sources is not a non-empty array or is empty."; }
        } catch (e) { console.error("Failed to parse image sources from HTML:", e); error = "Could not load image list. Check JSON in 'image-sources' script tag."; }
    } else { error = "Image sources script tag not found or empty."; }
    
    isLoading = false; 

    prevImageBtnEl.addEventListener('click', handlePrevImage);
    nextImageBtnEl.addEventListener('click', handleNextImage);
    borderRadiusSliderEl.addEventListener('input', handleBorderRadiusChange);

    if (scratchImageDisplayEl) {
        scratchImageDisplayEl.addEventListener('touchstart', handleTouchStart, { passive: false });
        scratchImageDisplayEl.addEventListener('mousedown', handleMouseDown);
    } else { console.error("Scratch image display element not found!"); }
    if (!touchEventOverlayEl) { console.error("Main touch event overlay element not found!"); }
    if (initialCtaOverlayEl) {
        initialCtaOverlayEl.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (!isInitialCtaDismissed) {
                dismissInitialCta();
            }
        });
    } else { console.error("Initial CTA overlay element not found!"); }

    const resizeObserver = new ResizeObserver(updateDisplayOnResize);
    if (scratchImageDisplayEl) { resizeObserver.observe(scratchImageDisplayEl); }
    
    // Initial call to set displayDimensions and render based on current state
    updateDisplayOnResize(); 

    if (imageUrls.length > 0 && !error) { // Only load if URLs are present and no initial error
        loadImageAndSetupQuads(imageUrls[currentImageIndex]); 
    } else { // No images or initial error (like JSON parse error)
        renderApp(); // Render to show appropriate message (no images/error)
    }
}

// Since script.js is loaded with 'defer', the DOM is parsed when it executes.
// requestAnimationFrame ensures layout is stable before initApp potentially reads dimensions.
requestAnimationFrame(initApp);
