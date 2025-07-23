// Interactive Scratch Image Script Version 17.0 (Robust Touch Fix)
// This script provides an interactive image display with quad subdivision.
// Implements "Area/Pencil Reveal" for touch and mouse interactions.
// Features rAF throttling, Initial CTA, and
// performance optimizations like quad merging and cascading reveals.
// Includes image preloading, optimized sliders, and dynamic CTA styling.
// This version fixes regressions from v16 by using a timestamp guard
// to prevent emulated mouse events, restoring all control functionality
// and ensuring consistent swipe detection on touch devices.

// --- Configuration Constants ---
const TARGET_IMAGE_WIDTH = 1280;
const TARGET_IMAGE_HEIGHT = 720;
const INITIAL_GRID_COLS = 5;
const INITIAL_GRID_ROWS = 3;
const MAX_QUAD_DEPTH = 6;
const MIN_QUAD_SIZE_CONFIG = 2;
const PENCIL_REVEAL_RADIUS_LOGICAL = 35; // Radius for area reveal
const AUTO_REVEAL_DEPTH_THRESHOLD = 3;
const CASCADE_REVEAL_DELAY = 10;
const INIT_POLL_INTERVAL = 100; // ms
const INIT_MAX_ATTEMPTS = 50; // 5 seconds total

// --- Application State ---
let imageUrls = [];
let currentImageIndex = 0;
let isLoading = true;
let error = null;
let quadBorderRadius = 50; // Default to 50% for circles
let topLevelQuads = null;
let originalImage = null;
let displayDimensions = null;
let isInitialCtaDismissed = false;

// --- DOM Element References ---
let appRootEl, scratchImageDisplayEl, imageControlsContainerEl, prevImageBtnEl, nextImageBtnEl, imageInfoEl, borderRadiusSliderEl, borderRadiusLabelEl, initialCtaOverlayEl, initialCtaContentEl;

// --- Interaction State ---
let isActiveTouchInteraction = false;
let isMouseInteractionActive = false;
let scheduledFrame = false;
let lastInteractionEvent = null;
let lastTouchEndTime = 0; // Timestamp to guard against emulated mouse events

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
            r += sourceImageData.data[pixelStartIndex];
            g += sourceImageData.data[pixelStartIndex + 1];
            b += sourceImageData.data[pixelStartIndex + 2];
            count++;
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

// --- Image Preloading ---
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

function startPreloadingAllImages() {
    if (!imageUrls || imageUrls.length < 2) return;
    imageUrls.forEach((url, index) => {
        if (index !== currentImageIndex) {
            preloadImage(url).catch(err => console.error(`Failed to preload image: ${url}`, err));
        }
    });
}

// --- Quad Tree Helpers ---
function findQuadAndParent(quadId, quads, parent = null) {
    for (const quad of quads) {
        if (quad.id === quadId) return { found: quad, parent };
        if (quad.isDivided && quad.children) {
            const result = findQuadAndParent(quadId, quad.children, quad);
            if (result.found) return result;
        }
    }
    return { found: null, parent: null };
}

function findQuadsInRadius(logicalX, logicalY, radius, quads) {
    let foundQuads = [];

    function checkQuad(quad) {
        const quadCenterX = quad.x + quad.width / 2;
        const quadCenterY = quad.y + quad.height / 2;
        const distX = Math.abs(logicalX - quadCenterX);
        const distY = Math.abs(logicalY - quadCenterY);
        if (distX > (quad.width / 2 + radius) || distY > (quad.height / 2 + radius)) {
            return;
        }

        const closestX = Math.max(quad.x, Math.min(logicalX, quad.x + quad.width));
        const closestY = Math.max(quad.y, Math.min(logicalY, quad.y + quad.height));
        const distanceSquared = (logicalX - closestX) ** 2 + (logicalY - closestY) ** 2;

        if (distanceSquared < radius ** 2) {
            if (quad.isDivided && quad.children) {
                quad.children.forEach(checkQuad);
            } else {
                if (isQuadInteractable(quad)) {
                    foundQuads.push(quad);
                }
            }
        }
    }

    quads.forEach(checkQuad);
    return foundQuads;
}


// --- Performance & UX Enhancement Functions ---
function attemptToMergeParent(childId) {
    if (!topLevelQuads) return;
    const { parent } = findQuadAndParent(childId, topLevelQuads);
    if (!parent || !parent.children || !parent.children.every(c => c.isRevealed)) return;
    parent.isRevealed = true;
    parent.isDivided = false;
    parent.children.forEach(child => document.getElementById(child.id)?.remove());
    parent.children = null;
    document.getElementById(parent.id)?.remove();
    renderSingleQuadElement(parent);
    if (parent.parentId) {
        attemptToMergeParent(parent.id);
    }
}

function startCascadingReveal(startQuad) {
    const revealQueue = [startQuad];
    const processed = new Set();
    const processQueue = () => {
        if (revealQueue.length === 0) return;
        const quad = revealQueue.shift();
        if (!quad || processed.has(quad.id)) {
            if (revealQueue.length > 0) setTimeout(processQueue, CASCADE_REVEAL_DELAY);
            return;
        }
        processed.add(quad.id);
        handleQuadInteraction(quad, true); // Force cascade
        if (quad.isDivided) {
            revealQueue.push(...quad.children);
        }
        if (revealQueue.length > 0) setTimeout(processQueue, CASCADE_REVEAL_DELAY);
    };
    processQueue();
}

// --- Core Application Logic ---
function loadImageAndSetupQuads(imageUrl) {
    isLoading = true;
    error = null;
    topLevelQuads = null;
    originalImage = null;
    isInitialCtaDismissed = false;
    renderApp();

    preloadImage(imageUrl).then(img => {
        if (img.naturalWidth === 0) throw new Error('Image loaded with zero dimensions');
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = TARGET_IMAGE_WIDTH;
        offscreenCanvas.height = TARGET_IMAGE_HEIGHT;
        const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Could not get 2D context');

        ctx.drawImage(img, 0, 0, TARGET_IMAGE_WIDTH, TARGET_IMAGE_HEIGHT);
        const imageData = ctx.getImageData(0, 0, TARGET_IMAGE_WIDTH, TARGET_IMAGE_HEIGHT);
        originalImage = { element: img, data: imageData, width: TARGET_IMAGE_WIDTH, height: TARGET_IMAGE_HEIGHT };

        const quadWidth = TARGET_IMAGE_WIDTH / INITIAL_GRID_COLS;
        const quadHeight = TARGET_IMAGE_HEIGHT / INITIAL_GRID_ROWS;
        topLevelQuads = Array.from({ length: INITIAL_GRID_ROWS * INITIAL_GRID_COLS }, (_, i) => {
            const row = Math.floor(i / INITIAL_GRID_COLS);
            const col = i % INITIAL_GRID_COLS;
            const x = col * quadWidth;
            const y = row * quadHeight;
            return {
                id: `quad-${row}-${col}`, x, y, width: quadWidth, height: quadHeight,
                color: getAverageColor(imageData, TARGET_IMAGE_WIDTH, x, y, quadWidth, quadHeight),
                depth: 0, isDivided: false, isRevealed: false,
            };
        });
        isLoading = false;
        renderApp();
        startPreloadingAllImages();
    }).catch(err => {
        console.error(`Failed to load image: ${imageUrl}`, err);
        error = `Failed to load image. Please try refreshing.`;
        isLoading = false;
        renderApp();
    });
}

function isQuadInteractable(quad) {
    if (!quad || quad.isRevealed) return false;
    const canRevealFinal = !quad.isDivided;
    return !quad.isRevealed && canRevealFinal;
}

function handleQuadInteraction(quad, isCascade = false) {
    if (!isQuadInteractable(quad)) return;
    const quadEl = document.getElementById(quad.id);

    if (quad.depth >= AUTO_REVEAL_DEPTH_THRESHOLD && !isCascade) {
        startCascadingReveal(quad);
        return;
    }

    if (quad.depth < MAX_QUAD_DEPTH) {
        subdivideQuadLogic(quad, originalImage.data, originalImage.width);
        quadEl?.remove();
        quad.children.forEach(child => renderSingleQuadElement(child));
    } else {
        quad.isRevealed = true;
        if (quadEl) {
            const bgPosX = -((quad.x / TARGET_IMAGE_WIDTH) * displayDimensions.width);
            const bgPosY = -((quad.y / TARGET_IMAGE_HEIGHT) * displayDimensions.height);
            quadEl.style.backgroundImage = `url(${originalImage.element.src})`;
            quadEl.style.backgroundSize = `${displayDimensions.width}px ${displayDimensions.height}px`;
            quadEl.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
            quadEl.style.borderRadius = '0%';
            quadEl.setAttribute('aria-label', `Image segment detail revealed.`);
        }
        attemptToMergeParent(quad.id);
    }
}

// --- Interaction Handlers ---
function processInteraction(e) {
    if (!topLevelQuads || (!isActiveTouchInteraction && !isMouseInteractionActive) || !displayDimensions) {
        scheduledFrame = false;
        return;
    }
    const rect = scratchImageDisplayEl.getBoundingClientRect();
    const isTouchEvent = 'touches' in e && e.touches.length > 0;
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    const logicalX = ((clientX - rect.left) / displayDimensions.width) * TARGET_IMAGE_WIDTH;
    const logicalY = ((clientY - rect.top) / displayDimensions.height) * TARGET_IMAGE_HEIGHT;
    const quadsToProcess = findQuadsInRadius(logicalX, logicalY, PENCIL_REVEAL_RADIUS_LOGICAL, topLevelQuads);
    quadsToProcess.forEach(quad => handleQuadInteraction(quad));
    scheduledFrame = false;
}

function handlePointerDown(e) {
    const isTouchEvent = 'touches' in e;
    // Guard against emulated mouse events after a touch interaction.
    if (!isTouchEvent && Date.now() - lastTouchEndTime < 500) {
        return;
    }
    if (isLoading || error) return;
    
    dismissInitialCta();

    if (isTouchEvent) {
        document.body.style.overflow = 'hidden'; // Prevent scroll on iOS
        isActiveTouchInteraction = true;
    } else {
        isMouseInteractionActive = true;
    }
    processInteraction(e); // Process first tap/click immediately
}

function handlePointerMove(e) {
    const isTouchEvent = 'touches' in e;
    if ((isTouchEvent && !isActiveTouchInteraction) || (!isTouchEvent && !isMouseInteractionActive)) {
      return;
    }

    lastInteractionEvent = e;
    if (!scheduledFrame) {
        scheduledFrame = true;
        requestAnimationFrame(() => processInteraction(lastInteractionEvent));
    }
}

function handlePointerUp(e) {
    if (isActiveTouchInteraction) {
        document.body.style.overflow = ''; // Re-enable scroll
        lastTouchEndTime = Date.now(); // Record when the touch sequence ends
    }
    isActiveTouchInteraction = false;
    isMouseInteractionActive = false;
}

function dismissInitialCta() {
    if (isInitialCtaDismissed || !initialCtaOverlayEl) return;
    isInitialCtaDismissed = true;
    initialCtaOverlayEl.classList.add('fade-out');
}

// --- DOM Rendering Functions ---
function renderSingleQuadElement(quadData) {
    if (!scratchImageDisplayEl || !originalImage || !displayDimensions) return;
    const quadEl = document.createElement('div');
    quadEl.id = quadData.id;
    quadEl.setAttribute('role', 'button');
    quadEl.style.position = 'absolute';
    quadEl.style.boxSizing = 'border-box';
    quadEl.style.border = '1px solid rgba(255,255,255,0.05)';
    quadEl.style.overflow = 'hidden';
    quadEl.style.transition = 'border-radius 0.2s ease-out, background-color 0.2s';

    const scaledX = (quadData.x / TARGET_IMAGE_WIDTH) * displayDimensions.width;
    const scaledY = (quadData.y / TARGET_IMAGE_HEIGHT) * displayDimensions.height;
    const scaledWidth = Math.max(0.5, (quadData.width / TARGET_IMAGE_WIDTH) * displayDimensions.width);
    const scaledHeight = Math.max(0.5, (quadData.height / TARGET_IMAGE_HEIGHT) * displayDimensions.height);

    quadEl.style.left = `${scaledX}px`;
    quadEl.style.top = `${scaledY}px`;
    quadEl.style.width = `${scaledWidth}px`;
    quadEl.style.height = `${scaledHeight}px`;

    quadEl.setAttribute('aria-label', `Image segment at depth ${quadData.depth}.`);

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
}

function initialFullRenderQuadsDOM() {
    if (!scratchImageDisplayEl || !topLevelQuads || !originalImage) return;

    const rect = scratchImageDisplayEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return;
    }
    displayDimensions = { width: rect.width, height: rect.height };

    Array.from(scratchImageDisplayEl.children).forEach(child => {
        if (child.getAttribute('role') === 'button') child.remove();
    });
    const renderRecursive = (quad) => {
        if (quad.isDivided && quad.children) {
            quad.children.forEach(renderRecursive);
        } else {
            renderSingleQuadElement(quad);
        }
    };
    topLevelQuads.forEach(renderRecursive);
}

function renderDisplayAreaContent() {
    if (!scratchImageDisplayEl) return;
    const quadsToRemove = scratchImageDisplayEl.querySelectorAll('[role="button"], .status-message-container');
    quadsToRemove.forEach(el => el.remove());

    scratchImageDisplayEl.style.aspectRatio = `${TARGET_IMAGE_WIDTH} / ${TARGET_IMAGE_HEIGHT}`;

    if (isLoading) {
        // No spinner, just show the black background
    } else if (error) {
        scratchImageDisplayEl.insertAdjacentHTML('beforeend', `<div class="status-message-container status-error"><p class="status-title">Error</p><p class="status-text">${error}</p></div>`);
    } else if (topLevelQuads) {
        initialFullRenderQuadsDOM();
        if (!isInitialCtaDismissed) {
            initialCtaOverlayEl.style.display = 'flex';
            initialCtaOverlayEl.classList.remove('fade-out');
        }
    }
}

function renderApp() {
    if (!appRootEl) return;
    renderDisplayAreaContent();

    const hasContent = imageUrls.length > 0;
    imageControlsContainerEl.style.display = hasContent ? 'flex' : 'none';

    if (hasContent) {
        prevImageBtnEl.disabled = isLoading || currentImageIndex === 0;
        nextImageBtnEl.disabled = isLoading || currentImageIndex === imageUrls.length - 1;
        imageInfoEl.textContent = `Image ${currentImageIndex + 1} of ${imageUrls.length}`;
        borderRadiusSliderEl.disabled = isLoading;
    }
}

// --- UI Control Event Handlers ---
function handlePrevClick() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        loadImageAndSetupQuads(imageUrls[currentImageIndex]);
    }
}

function handleNextClick() {
    if (currentImageIndex < imageUrls.length - 1) {
        currentImageIndex++;
        loadImageAndSetupQuads(imageUrls[currentImageIndex]);
    }
}

function handleBorderRadiusChange(e) {
    quadBorderRadius = parseInt(e.target.value, 10);
    borderRadiusLabelEl.textContent = `Corner Roundness: ${quadBorderRadius}%`;
    const quads = scratchImageDisplayEl.querySelectorAll('[role="button"]');
    quads.forEach(quadEl => {
        const { found } = findQuadAndParent(quadEl.id, topLevelQuads);
        if (found && !found.isRevealed) {
            quadEl.style.borderRadius = `${quadBorderRadius}%`;
        }
    });
    if (initialCtaContentEl) {
        initialCtaContentEl.style.borderRadius = `${quadBorderRadius}%`;
    }
}

function handleResize() {
    if (topLevelQuads && !isLoading && !error) {
        initialFullRenderQuadsDOM();
    }
}

// --- App Initialization ---
function initializeAppState() {
    appRootEl = document.getElementById('vanilla-app-root');
    scratchImageDisplayEl = document.getElementById('scratch-image-display');
    imageControlsContainerEl = document.getElementById('image-controls-container');
    prevImageBtnEl = document.getElementById('prev-image-btn');
    nextImageBtnEl = document.getElementById('next-image-btn');
    imageInfoEl = document.getElementById('image-info');
    borderRadiusSliderEl = document.getElementById('border-radius-slider');
    borderRadiusLabelEl = document.getElementById('border-radius-label');
    initialCtaOverlayEl = document.getElementById('initial-cta-overlay');
    initialCtaContentEl = document.getElementById('initial-cta-content');
    return appRootEl && scratchImageDisplayEl && imageControlsContainerEl;
}

function initApp() {
    if (!initializeAppState()) {
        console.error("Core application elements not found. Initialization failed.");
        return;
    }

    const sourcesScript = document.getElementById('image-sources');
    try {
        imageUrls = JSON.parse(sourcesScript.textContent);
    } catch (e) {
        error = "Could not parse image sources.";
        console.error(error, e);
        renderApp();
        return;
    }
    
    // Set initial UI state from defaults
    borderRadiusSliderEl.value = quadBorderRadius;
    borderRadiusLabelEl.textContent = `Corner Roundness: ${quadBorderRadius}%`;
    if (initialCtaContentEl) {
        initialCtaContentEl.style.borderRadius = `${quadBorderRadius}%`;
    }

    // Event Listeners
    prevImageBtnEl.addEventListener('click', handlePrevClick);
    nextImageBtnEl.addEventListener('click', handleNextClick);
    borderRadiusSliderEl.addEventListener('change', handleBorderRadiusChange);
    
    // Unified pointer events
    scratchImageDisplayEl.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    scratchImageDisplayEl.addEventListener('touchstart', handlePointerDown, { passive: false });
    document.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);
    document.addEventListener('touchcancel', handlePointerUp);

    initialCtaOverlayEl.addEventListener('click', dismissInitialCta);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });

    if (imageUrls.length > 0) {
        loadImageAndSetupQuads(imageUrls[currentImageIndex]);
    } else {
        error = "No images found to display.";
        isLoading = false;
        renderApp();
    }
}

// Robust initialization polling
let attempts = 0;
const intervalId = setInterval(() => {
    attempts++;
    if (initializeAppState()) {
        clearInterval(intervalId);
        initApp();
    } else if (attempts > INIT_MAX_ATTEMPTS) {
        clearInterval(intervalId);
        console.error("Application failed to initialize after several attempts. Essential DOM elements are missing.");
        document.body.innerHTML = `<div class="status-message-container status-error"><p class="status-title">Fatal Error</p><p class="status-text">Could not start the application.</p></div>`;
    }
}, INIT_POLL_INTERVAL);
