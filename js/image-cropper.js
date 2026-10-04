/**
 * NathKhat - High-Performance Image Crop, Zoom & Fast Loading Engine
 * Features:
 * - Instant preview loading using fast Object URLs (0ms UI lag)
 * - Freeform & Preset Aspect Ratio Cropping (1:1, 4:3, 16:9, Original)
 * - 8 Interactive Handles + Movable Crop Box with Rule-of-Thirds Grid
 * - Smooth Interactive Zoom (Slider, +/- Buttons, Mouse Wheel & Touch Pinch)
 * - Pan, 90° Rotations & Horizontal/Vertical Flips
 * - Fast Downsampling & Canvas Optimization (prevents storage bloat)
 * - Device Upload, Drag-and-Drop & Clipboard Paste (Ctrl+V)
 * - In-Editor Floating Image Toolbar (Crop, Resize 100%/75%/50%, Delete)
 * - Fullscreen Interactive Zoom Lightbox for Study Diagrams & Formulas
 */

const ImageCropper = (function () {
  // Internal State
  const state = {
    isOpen: false,
    sourceUrl: null,
    objectUrlToRevoke: null,
    sourceImg: null,
    naturalW: 0,
    naturalH: 0,
    displayWidth: 0,
    displayHeight: 0,
    baseScale: 1,
    imgCenterX: 0,
    imgCenterY: 0,

    // Transformations
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0, // 0, 90, 180, 270
    flipH: 1,    // 1 or -1
    flipV: 1,    // 1 or -1

    // Crop Box
    cropBox: { x: 0, y: 0, width: 0, height: 0 },
    aspectRatio: null, // null for free, or numeric (e.g. 1, 4/3, 16/9)

    // Interaction Flags
    isInteracting: false,
    activeHandle: null,
    isDraggingBox: false,
    isPanning: false,
    dragStartX: 0,
    dragStartY: 0,
    boxStartX: 0,
    boxStartY: 0,
    boxStartW: 0,
    boxStartH: 0,
    panStartX: 0,
    panStartY: 0,

    // Touch Support
    initialPinchDist: 0,
    initialPinchZoom: 1,

    // Target Context
    targetEditor: null,
    targetImg: null,
    savedRange: null,

    // Lightbox State
    lightboxOpen: false,
    lightboxZoom: 1,
    lightboxPanX: 0,
    lightboxPanY: 0,
    lightboxDragging: false,
    lightboxDragStart: { x: 0, y: 0 }
  };

  // Cached DOM Elements
  let DOM = {};

  function init() {
    cacheDomElements();
    bindCropperEvents();
    bindGlobalPasteAndDrop();
    bindLightboxEvents();
    bindEditorBubbleEvents();
  }

  function cacheDomElements() {
    DOM = {
      // Cropper Modal
      modal: document.getElementById('imageCropperModal'),
      closeBtn: document.getElementById('closeCropperModalBtn'),
      stage: document.getElementById('cropperStage'),
      canvasWrap: document.getElementById('cropperCanvasWrap'),
      sourceImg: document.getElementById('cropperSourceImg'),
      box: document.getElementById('cropperBox'),
      dimsBadge: document.getElementById('cropperDimsBadge'),

      // Zoom Controls
      zoomOutBtn: document.getElementById('cropperZoomOutBtn'),
      zoomSlider: document.getElementById('cropperZoomSlider'),
      zoomInBtn: document.getElementById('cropperZoomInBtn'),
      zoomFitBtn: document.getElementById('cropperZoomFitBtn'),
      zoomVal: document.getElementById('cropperZoomVal'),

      // Aspect Ratio & Transforms
      ratioGroup: document.getElementById('cropperRatioGroup'),
      rotateLeftBtn: document.getElementById('cropperRotateLeftBtn'),
      rotateRightBtn: document.getElementById('cropperRotateRightBtn'),
      flipHBtn: document.getElementById('cropperFlipHBtn'),
      flipVBtn: document.getElementById('cropperFlipVBtn'),
      resetBtn: document.getElementById('cropperResetBtn'),

      // Action Buttons
      skipBtn: document.getElementById('cropperSkipBtn'),
      cancelBtn: document.getElementById('cancelCropperBtn'),
      applyBtn: document.getElementById('applyCropBtn'),

      // Lightbox
      lightbox: document.getElementById('imageLightboxModal'),
      lightboxStage: document.getElementById('lightboxStage'),
      lightboxImg: document.getElementById('lightboxImg'),
      lightboxZoomOutBtn: document.getElementById('lightboxZoomOutBtn'),
      lightboxZoomInBtn: document.getElementById('lightboxZoomInBtn'),
      lightboxResetBtn: document.getElementById('lightboxResetBtn'),
      lightboxZoomLevel: document.getElementById('lightboxZoomLevel'),
      lightboxDownloadBtn: document.getElementById('lightboxDownloadBtn'),
      closeLightboxBtn: document.getElementById('closeLightboxBtn'),

      // Floating Bubble for in-editor images
      editorBubble: document.getElementById('editorImgBubble'),
      bubbleCropBtn: document.getElementById('bubbleCropBtn'),
      bubbleDeleteBtn: document.getElementById('bubbleDeleteBtn')
    };
  }

  /* ==========================================================================
     Open & Fast Image Loading
     ========================================================================== */

  /**
   * Opens Cropper with ultra-fast instant preview
   * @param {File|Blob|string} source - File, Blob or Image URL
   * @param {HTMLElement} [targetEditor] - Active contenteditable container
   * @param {HTMLImageElement} [targetImg] - Existing image if re-cropping
   */
  function openCropper(source, targetEditor, targetImg = null) {
    if (!source) return;

    // Detect target editor if not provided
    if (!targetEditor) {
      const topicModal = document.getElementById('topicModal');
      const noteModal = document.getElementById('noteModal');
      if (topicModal && topicModal.classList.contains('open')) {
        targetEditor = document.getElementById('topicExplanationEditor');
      } else if (noteModal && noteModal.classList.contains('open')) {
        targetEditor = document.getElementById('noteExplanationEditor');
      } else {
        // Default to active view
        const activeTab = document.querySelector('.nav-tab-btn.active');
        const view = activeTab ? activeTab.getAttribute('data-view') : 'topicsView';
        if (view === 'notepadView') {
          const openNoteBtn = document.getElementById('openAddNoteBtn');
          if (openNoteBtn) openNoteBtn.click();
          targetEditor = document.getElementById('noteExplanationEditor');
        } else {
          const openTopicBtn = document.getElementById('openAddTopicBtn');
          if (openTopicBtn) openTopicBtn.click();
          targetEditor = document.getElementById('topicExplanationEditor');
        }
      }
    }

    state.targetEditor = targetEditor;
    state.targetImg = targetImg;

    // Save active text selection/caret range inside editor
    saveSelection(targetEditor);

    // Clean up previous temporary object URL if any
    if (state.objectUrlToRevoke) {
      URL.revokeObjectURL(state.objectUrlToRevoke);
      state.objectUrlToRevoke = null;
    }

    let imgUrl = '';
    if (source instanceof Blob || source instanceof File) {
      // Instant memory pointer URL (loads in <2ms, 0 delay)
      imgUrl = URL.createObjectURL(source);
      state.objectUrlToRevoke = imgUrl;
    } else if (typeof source === 'string') {
      imgUrl = source;
    }

    state.sourceUrl = imgUrl;

    // Reset transform states
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    state.rotation = 0;
    state.flipH = 1;
    state.flipV = 1;
    state.aspectRatio = null; // freeform by default

    // Reset aspect ratio buttons
    if (DOM.ratioGroup) {
      DOM.ratioGroup.querySelectorAll('.btn-ratio').forEach(btn => {
        if (btn.getAttribute('data-ratio') === 'free') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Fast Image Load into Cropper
    const img = new Image();
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      state.naturalW = img.naturalWidth || img.width;
      state.naturalH = img.naturalHeight || img.height;
      state.sourceImg = img;

      if (DOM.sourceImg) {
        DOM.sourceImg.src = imgUrl;
      }

      // Display Modal first so stage has bounding dimensions
      if (DOM.modal) {
        DOM.modal.classList.add('open');
        state.isOpen = true;
      }

      // Compute geometries with requestAnimationFrame + setTimeout for layout stabilization
      requestAnimationFrame(() => {
        calculateStageGeometry();
        updateTransform();
        updateCropBox();
        setTimeout(() => {
          calculateStageGeometry();
          updateTransform();
          updateCropBox();
        }, 50);
      });
    };

    img.onerror = () => {
      if (typeof window.showToast === 'function') {
        window.showToast('Unable to load image. Please try another file.', 'error');
      } else {
        alert('Unable to load image.');
      }
    };

    img.src = imgUrl;
  }

  function closeCropper() {
    if (DOM.modal) {
      DOM.modal.classList.remove('open');
    }
    state.isOpen = false;
    state.isInteracting = false;

    if (state.objectUrlToRevoke) {
      URL.revokeObjectURL(state.objectUrlToRevoke);
      state.objectUrlToRevoke = null;
    }
  }

  /* ==========================================================================
     Cropper Geometry & Rendering Math
     ========================================================================== */

  function calculateStageGeometry() {
    if (!DOM.stage) return;

    const stageRect = DOM.stage.getBoundingClientRect();
    const stageW = Math.max(stageRect.width, 320);
    const stageH = Math.max(stageRect.height, 280);

    const pad = 36;
    const availW = Math.max(stageW - pad * 2, 100);
    const availH = Math.max(stageH - pad * 2, 100);

    // Fit image inside stage boundary
    state.baseScale = Math.min(availW / state.naturalW, availH / state.naturalH);
    state.displayWidth = Math.round(state.naturalW * state.baseScale);
    state.displayHeight = Math.round(state.naturalH * state.baseScale);

    state.imgCenterX = Math.round(stageW / 2);
    state.imgCenterY = Math.round(stageH / 2);

    if (DOM.canvasWrap) {
      DOM.canvasWrap.style.width = `${state.displayWidth}px`;
      DOM.canvasWrap.style.height = `${state.displayHeight}px`;
      DOM.canvasWrap.style.left = `${state.imgCenterX - state.displayWidth / 2}px`;
      DOM.canvasWrap.style.top = `${state.imgCenterY - state.displayHeight / 2}px`;
    }

    // Initialize Crop Box to cover 85% of image, centered
    const boxW = Math.round(state.displayWidth * 0.88);
    const boxH = Math.round(state.displayHeight * 0.88);
    const boxX = Math.round(state.imgCenterX - boxW / 2);
    const boxY = Math.round(state.imgCenterY - boxH / 2);

    state.cropBox = {
      x: Math.max(boxX, 10),
      y: Math.max(boxY, 10),
      width: Math.max(boxW, 60),
      height: Math.max(boxH, 60)
    };
  }

  function updateTransform() {
    if (!DOM.canvasWrap) return;

    // Apply 60fps hardware-accelerated CSS transform
    const transformStr = `translate(${state.panX}px, ${state.panY}px) rotate(${state.rotation}deg) scale(${state.zoom * state.flipH}, ${state.zoom * state.flipV})`;
    DOM.canvasWrap.style.transform = transformStr;

    // Update Zoom controls
    const zoomPct = Math.round(state.zoom * 100);
    if (DOM.zoomSlider) DOM.zoomSlider.value = zoomPct;
    if (DOM.zoomVal) DOM.zoomVal.textContent = `${zoomPct}%`;
  }

  function updateCropBox() {
    if (!DOM.box) return;

    DOM.box.style.left = `${state.cropBox.x}px`;
    DOM.box.style.top = `${state.cropBox.y}px`;
    DOM.box.style.width = `${state.cropBox.width}px`;
    DOM.box.style.height = `${state.cropBox.height}px`;

    // Compute original image pixel resolution of the cropped area
    if (DOM.dimsBadge && state.baseScale > 0) {
      const realW = Math.round(state.cropBox.width / (state.baseScale * state.zoom));
      const realH = Math.round(state.cropBox.height / (state.baseScale * state.zoom));
      DOM.dimsBadge.textContent = `${realW} × ${realH} px`;
    }
  }

  /* ==========================================================================
     Cropper Event Listeners (Drag, Resize, Zoom, Touch)
     ========================================================================== */

  function bindCropperEvents() {
    if (!DOM.stage) return;

    // Close and Cancel buttons
    if (DOM.closeBtn) DOM.closeBtn.addEventListener('click', closeCropper);
    if (DOM.cancelBtn) DOM.cancelBtn.addEventListener('click', closeCropper);

    // Apply Crop Button
    if (DOM.applyBtn) DOM.applyBtn.addEventListener('click', applyCropAndInsert);

    // Skip Crop (Fast Insert without crop)
    if (DOM.skipBtn) DOM.skipBtn.addEventListener('click', skipCropAndInsert);

    // Zoom Controls
    if (DOM.zoomSlider) {
      DOM.zoomSlider.addEventListener('input', (e) => {
        setZoom(parseInt(e.target.value, 10) / 100);
      });
    }

    if (DOM.zoomInBtn) {
      DOM.zoomInBtn.addEventListener('click', () => {
        setZoom(state.zoom + 0.15);
      });
    }

    if (DOM.zoomOutBtn) {
      DOM.zoomOutBtn.addEventListener('click', () => {
        setZoom(state.zoom - 0.15);
      });
    }

    if (DOM.zoomFitBtn) {
      DOM.zoomFitBtn.addEventListener('click', () => {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        updateTransform();
        updateCropBox();
      });
    }

    // Mouse Wheel Zoom on Stage
    DOM.stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom(state.zoom + delta);
    }, { passive: false });

    // Aspect Ratio Buttons
    if (DOM.ratioGroup) {
      DOM.ratioGroup.querySelectorAll('.btn-ratio').forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.ratioGroup.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const ratioVal = btn.getAttribute('data-ratio');
          setAspectRatio(ratioVal);
        });
      });
    }

    // Transforms (Rotations & Flips)
    if (DOM.rotateLeftBtn) {
      DOM.rotateLeftBtn.addEventListener('click', () => {
        state.rotation = (state.rotation - 90 + 360) % 360;
        updateTransform();
      });
    }

    if (DOM.rotateRightBtn) {
      DOM.rotateRightBtn.addEventListener('click', () => {
        state.rotation = (state.rotation + 90) % 360;
        updateTransform();
      });
    }

    if (DOM.flipHBtn) {
      DOM.flipHBtn.addEventListener('click', () => {
        state.flipH *= -1;
        updateTransform();
      });
    }

    if (DOM.flipVBtn) {
      DOM.flipVBtn.addEventListener('click', () => {
        state.flipV *= -1;
        updateTransform();
      });
    }

    if (DOM.resetBtn) {
      DOM.resetBtn.addEventListener('click', () => {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        state.rotation = 0;
        state.flipH = 1;
        state.flipV = 1;
        setAspectRatio('free');
        if (DOM.ratioGroup) {
          DOM.ratioGroup.querySelectorAll('.btn-ratio').forEach(b => {
            if (b.getAttribute('data-ratio') === 'free') b.classList.add('active');
            else b.classList.remove('active');
          });
        }
        calculateStageGeometry();
        updateTransform();
        updateCropBox();
      });
    }

    // Mouse / Touch Interaction on Stage & Crop Box
    DOM.stage.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Touch Gestures
    DOM.stage.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  }

  function setZoom(val) {
    state.zoom = Math.min(Math.max(parseFloat(val) || 1, 0.2), 4.0);
    updateTransform();
    updateCropBox();
  }

  function setAspectRatio(ratioType) {
    if (ratioType === 'free') {
      state.aspectRatio = null;
      return;
    }

    let targetRatio = 1;
    if (ratioType === '1:1') targetRatio = 1;
    else if (ratioType === '4:3') targetRatio = 4 / 3;
    else if (ratioType === '16:9') targetRatio = 16 / 9;
    else if (ratioType === 'original') targetRatio = state.naturalW / state.naturalH;

    state.aspectRatio = targetRatio;

    // Adapt current crop box to maintain aspect ratio centered
    const cx = state.cropBox.x + state.cropBox.width / 2;
    const cy = state.cropBox.y + state.cropBox.height / 2;

    let newW = state.cropBox.width;
    let newH = Math.round(newW / targetRatio);

    const stageRect = DOM.stage.getBoundingClientRect();
    if (newH > stageRect.height - 20) {
      newH = stageRect.height - 20;
      newW = Math.round(newH * targetRatio);
    }

    state.cropBox.width = Math.max(Math.round(newW), 50);
    state.cropBox.height = Math.max(Math.round(newH), 50);
    state.cropBox.x = Math.max(Math.round(cx - state.cropBox.width / 2), 5);
    state.cropBox.y = Math.max(Math.round(cy - state.cropBox.height / 2), 5);

    updateCropBox();
  }

  /* ==========================================================================
     Pointer Interaction (Move Box, Resize Handles, Pan Image)
     ========================================================================== */

  function onPointerDown(e) {
    if (!state.isOpen) return;

    const handleEl = e.target.closest('.cropper-handle');
    const isBox = e.target === DOM.box || (DOM.box && DOM.box.contains(e.target) && !handleEl);

    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    state.boxStartX = state.cropBox.x;
    state.boxStartY = state.cropBox.y;
    state.boxStartW = state.cropBox.width;
    state.boxStartH = state.cropBox.height;
    state.panStartX = state.panX;
    state.panStartY = state.panY;

    if (handleEl) {
      // Handle Resizing
      state.isInteracting = true;
      state.activeHandle = handleEl.getAttribute('data-handle');
      e.preventDefault();
    } else if (isBox) {
      // Box Dragging
      state.isInteracting = true;
      state.isDraggingBox = true;
      e.preventDefault();
    } else {
      // Background Image Panning
      state.isInteracting = true;
      state.isPanning = true;
      e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (!state.isInteracting || !state.isOpen) return;

    const dx = e.clientX - state.dragStartX;
    const dy = e.clientY - state.dragStartY;
    const stageRect = DOM.stage.getBoundingClientRect();

    if (state.activeHandle) {
      resizeCropBox(dx, dy, state.activeHandle, stageRect);
    } else if (state.isDraggingBox) {
      moveCropBox(dx, dy, stageRect);
    } else if (state.isPanning) {
      state.panX = state.panStartX + dx;
      state.panY = state.panStartY + dy;
      updateTransform();
    }
  }

  function onPointerUp() {
    state.isInteracting = false;
    state.activeHandle = null;
    state.isDraggingBox = false;
    state.isPanning = false;
  }

  function moveCropBox(dx, dy, stageRect) {
    let newX = state.boxStartX + dx;
    let newY = state.boxStartY + dy;

    // Clamp within stage bounds
    const maxX = stageRect.width - state.cropBox.width;
    const maxY = stageRect.height - state.cropBox.height;

    state.cropBox.x = Math.max(0, Math.min(newX, maxX));
    state.cropBox.y = Math.max(0, Math.min(newY, maxY));

    updateCropBox();
  }

  function resizeCropBox(dx, dy, handle, stageRect) {
    let x = state.boxStartX;
    let y = state.boxStartY;
    let w = state.boxStartW;
    let h = state.boxStartH;
    const minSize = 40;
    const ratio = state.aspectRatio;

    switch (handle) {
      case 'se':
        w += dx;
        h = ratio ? Math.round(w / ratio) : h + dy;
        break;
      case 'sw':
        w -= dx;
        h = ratio ? Math.round(w / ratio) : h + dy;
        x = state.boxStartX + (state.boxStartW - w);
        break;
      case 'ne':
        w += dx;
        h = ratio ? Math.round(w / ratio) : h - dy;
        y = state.boxStartY + (state.boxStartH - h);
        break;
      case 'nw':
        w -= dx;
        h = ratio ? Math.round(w / ratio) : h - dy;
        x = state.boxStartX + (state.boxStartW - w);
        y = state.boxStartY + (state.boxStartH - h);
        break;
      case 'e':
        w += dx;
        if (ratio) {
          h = Math.round(w / ratio);
          y = state.boxStartY + (state.boxStartH - h) / 2;
        }
        break;
      case 'w':
        w -= dx;
        x = state.boxStartX + (state.boxStartW - w);
        if (ratio) {
          h = Math.round(w / ratio);
          y = state.boxStartY + (state.boxStartH - h) / 2;
        }
        break;
      case 's':
        h += dy;
        if (ratio) {
          w = Math.round(h * ratio);
          x = state.boxStartX + (state.boxStartW - w) / 2;
        }
        break;
      case 'n':
        h -= dy;
        y = state.boxStartY + (state.boxStartH - h);
        if (ratio) {
          w = Math.round(h * ratio);
          x = state.boxStartX + (state.boxStartW - w) / 2;
        }
        break;
    }

    if (w >= minSize && h >= minSize) {
      state.cropBox.x = Math.max(0, x);
      state.cropBox.y = Math.max(0, y);
      state.cropBox.width = Math.min(w, stageRect.width - state.cropBox.x);
      state.cropBox.height = Math.min(h, stageRect.height - state.cropBox.y);
      updateCropBox();
    }
  }

  /* ==========================================================================
     Touch Support (Pinch to Zoom & Touch Drag)
     ========================================================================== */

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      state.initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      state.initialPinchZoom = state.zoom;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      onPointerDown({
        target: touch.target,
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault()
      });
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (state.initialPinchDist > 0) {
        const factor = currentDist / state.initialPinchDist;
        setZoom(state.initialPinchZoom * factor);
      }
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      onPointerMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }
  }

  function onTouchEnd() {
    onPointerUp();
  }

  /* ==========================================================================
     Canvas Crop Rendering & Output Generation
     ========================================================================== */

  function applyCropAndInsert() {
    if (!state.sourceImg || !state.sourceImg.complete) return;

    try {
      // Calculate output canvas size based on real original image pixels
      const scaleFactor = 1 / (state.baseScale * state.zoom);
      const rawCroppedW = Math.round(state.cropBox.width * scaleFactor);
      const rawCroppedH = Math.round(state.cropBox.height * scaleFactor);

      // Downscale if image is massive (keeps under 1400px for instant rendering & lightweight storage)
      const maxDim = 1400;
      let outScale = 1;
      if (rawCroppedW > maxDim || rawCroppedH > maxDim) {
        outScale = maxDim / Math.max(rawCroppedW, rawCroppedH);
      }

      const outW = Math.max(Math.round(rawCroppedW * outScale), 30);
      const outH = Math.max(Math.round(rawCroppedH * outScale), 30);

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      // Check for PNG / transparency support
      const isPng = (state.sourceUrl && (state.sourceUrl.includes('.png') || state.sourceUrl.includes('image/png')));
      if (!isPng) {
        // Fill canvas with white so transparent regions never turn black in JPEG
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
        ctx.restore();
      }

      // Mathematical mapping from Stage coordinates to Output Canvas
      const stageToCanvas = outW / state.cropBox.width;

      ctx.scale(stageToCanvas, stageToCanvas);
      ctx.translate(-state.cropBox.x, -state.cropBox.y);

      // Apply image position & transforms in stage coordinates
      const cx = state.imgCenterX + state.panX;
      const cy = state.imgCenterY + state.panY;

      ctx.translate(cx, cy);
      ctx.rotate((state.rotation * Math.PI) / 180);
      ctx.scale(state.zoom * state.flipH, state.zoom * state.flipV);

      // Draw original source image centered
      ctx.drawImage(
        state.sourceImg,
        -state.displayWidth / 2,
        -state.displayHeight / 2,
        state.displayWidth,
        state.displayHeight
      );

      // Export as high-quality web data URL
      const mimeType = isPng ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.88);

      insertResultIntoEditor(dataUrl);
      closeCropper();

      if (typeof window.showToast === 'function') {
        window.showToast('Image cropped & inserted successfully!', 'success');
      }
    } catch (err) {
      console.error('Error generating cropped canvas:', err);
      if (typeof window.showToast === 'function') {
        window.showToast('Failed to crop image', 'error');
      }
    }
  }

  function skipCropAndInsert() {
    if (!state.sourceImg || !state.sourceImg.complete) return;

    try {
      // Insert whole image, downscaled to max 1400px if oversized
      const maxDim = 1400;
      const natW = state.naturalW;
      const natH = state.naturalH;
      const scale = Math.min(1, maxDim / Math.max(natW, natH));

      const outW = Math.round(natW * scale);
      const outH = Math.round(natH * scale);

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const isPng = (state.sourceUrl && (state.sourceUrl.includes('.png') || state.sourceUrl.includes('image/png')));
      if (!isPng) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
      }

      // Apply user rotations or flips if applied
      if (state.rotation !== 0 || state.flipH !== 1 || state.flipV !== 1) {
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate((state.rotation * Math.PI) / 180);
        ctx.scale(state.flipH, state.flipV);
        ctx.drawImage(state.sourceImg, -outW / 2, -outH / 2, outW, outH);
      } else {
        ctx.drawImage(state.sourceImg, 0, 0, outW, outH);
      }

      const mimeType = isPng ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.88);
      insertResultIntoEditor(dataUrl);
      closeCropper();

      if (typeof window.showToast === 'function') {
        window.showToast('Image inserted!', 'success');
      }
    } catch (e) {
      console.error('Skip crop failed:', e);
    }
  }

  function insertResultIntoEditor(dataUrl) {
    const editor = state.targetEditor || document.getElementById('topicExplanationEditor');
    if (!editor) return;

    editor.focus();

    // If re-cropping an existing image in the editor
    if (state.targetImg && state.targetImg.parentNode) {
      state.targetImg.src = dataUrl;
      state.targetImg.classList.add('content-zoomable-img');
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    // Insert new image at cursor position
    const imgEl = document.createElement('img');
    imgEl.src = dataUrl;
    imgEl.alt = 'Study Note Image';
    imgEl.className = 'content-zoomable-img';
    imgEl.setAttribute('tabindex', '0');

    let inserted = false;
    if (state.savedRange) {
      try {
        state.savedRange.deleteContents();
        state.savedRange.insertNode(imgEl);

        // Move cursor right after the newly inserted image
        const newRange = document.createRange();
        newRange.setStartAfter(imgEl);
        newRange.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(newRange);
        inserted = true;
      } catch (e) {
        inserted = false;
      }
    }

    if (!inserted) {
      editor.appendChild(imgEl);
    }

    // Dispatch input event so autosave or changes are registered
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function saveSelection(editor) {
    state.savedRange = null;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor) {
      const range = sel.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer)) {
        state.savedRange = range.cloneRange();
      }
    }
  }

  /* ==========================================================================
     Device Upload, Drag & Drop, and Clipboard Paste (Ctrl+V)
     ========================================================================== */

  function bindGlobalPasteAndDrop() {
    // 1. Global Clipboard Paste (Ctrl+V)
    window.addEventListener('paste', (e) => {
      // Don't intercept paste if focused inside regular text inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        // Exception: allow paste if target is search or text input?
        // If image was pasted on text input, check if user actually copied an image file
      }

      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            e.stopPropagation();

            // Detect active editor
            let targetEditor = null;
            if (activeEl && activeEl.classList.contains('editor-content-area')) {
              targetEditor = activeEl;
            }

            openCropper(blob, targetEditor);
            if (typeof window.showToast === 'function') {
              window.showToast('Pasted image loaded into Cropper!', 'info');
            }
            break;
          }
        }
      }
    }, true);

    // 3. Drag and Drop on Editors
    const editors = [
      document.getElementById('topicExplanationEditor'),
      document.getElementById('noteExplanationEditor'),
      document.getElementById('topicModal'),
      document.getElementById('noteModal')
    ];

    editors.forEach(el => {
      if (!el) return;

      el.addEventListener('dragover', (e) => {
        if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          el.classList.add('drag-over-active');
        }
      });

      el.addEventListener('dragleave', () => {
        el.classList.remove('drag-over-active');
      });

      el.addEventListener('drop', (e) => {
        el.classList.remove('drag-over-active');
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          for (let f of files) {
            if (f.type.startsWith('image/')) {
              e.preventDefault();
              e.stopPropagation();
              const editor = el.classList.contains('editor-content-area')
                ? el
                : el.querySelector('.editor-content-area');
              openCropper(f, editor);
              break;
            }
          }
        }
      });
    });
  }

  /* ==========================================================================
     In-Editor Floating Image Toolbar
     ========================================================================== */

  let currentSelectedImg = null;

  function bindEditorBubbleEvents() {
    const bubble = DOM.editorBubble;
    if (!bubble) return;

    // Listen for image clicks inside editors
    document.addEventListener('click', (e) => {
      const img = e.target.closest('.editor-content-area img');
      if (img) {
        e.stopPropagation();
        selectEditorImage(img);
      } else if (!e.target.closest('#editorImgBubble')) {
        deselectEditorImage();
      }
    });

    // Bubble Crop & Zoom Button
    if (DOM.bubbleCropBtn) {
      DOM.bubbleCropBtn.addEventListener('click', () => {
        if (currentSelectedImg) {
          const editor = currentSelectedImg.closest('.editor-content-area');
          openCropper(currentSelectedImg.src, editor, currentSelectedImg);
          deselectEditorImage();
        }
      });
    }

    // Bubble Resize Buttons (100%, 75%, 50%)
    bubble.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentSelectedImg) {
          const pct = btn.getAttribute('data-size');
          currentSelectedImg.style.maxWidth = `${pct}%`;
          currentSelectedImg.style.width = 'auto';
          positionBubble(currentSelectedImg);
          const editor = currentSelectedImg.closest('.editor-content-area');
          if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });

    // Bubble Delete Button
    if (DOM.bubbleDeleteBtn) {
      DOM.bubbleDeleteBtn.addEventListener('click', () => {
        if (currentSelectedImg) {
          const editor = currentSelectedImg.closest('.editor-content-area');
          currentSelectedImg.remove();
          deselectEditorImage();
          if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
          if (typeof window.showToast === 'function') {
            window.showToast('Image removed', 'info');
          }
        }
      });
    }

    // Hide bubble on scroll
    window.addEventListener('scroll', deselectEditorImage, true);
  }

  function selectEditorImage(img) {
    if (currentSelectedImg) {
      currentSelectedImg.classList.remove('selected-editor-img');
    }
    currentSelectedImg = img;
    img.classList.add('selected-editor-img');
    positionBubble(img);
  }

  function deselectEditorImage() {
    if (currentSelectedImg) {
      currentSelectedImg.classList.remove('selected-editor-img');
      currentSelectedImg = null;
    }
    if (DOM.editorBubble) {
      DOM.editorBubble.classList.remove('visible');
    }
  }

  function positionBubble(img) {
    const bubble = DOM.editorBubble;
    if (!bubble) return;

    const rect = img.getBoundingClientRect();
    bubble.classList.add('visible');

    const bubbleW = bubble.offsetWidth || 260;
    const bubbleH = bubble.offsetHeight || 38;

    let left = rect.left + rect.width / 2 - bubbleW / 2;
    let top = rect.top - bubbleH - 8;

    // Viewport bounds clamping
    if (left < 10) left = 10;
    if (left + bubbleW > window.innerWidth - 10) left = window.innerWidth - bubbleW - 10;
    if (top < 10) top = rect.bottom + 8; // flip below if at top edge

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  }

  /* ==========================================================================
     Fullscreen Zoom Lightbox (for studying cards)
     ========================================================================== */

  function bindLightboxEvents() {
    // Open Lightbox when clicking images in rendered topic/note cards
    document.addEventListener('click', (e) => {
      const cardImg = e.target.closest('.explanation-body img, .note-card-content img, .content-zoomable-img');
      // Only trigger if outside editor
      if (cardImg && !cardImg.closest('.editor-content-area')) {
        e.preventDefault();
        openLightbox(cardImg.src, cardImg.alt || 'Study Diagram');
      }
    });

    if (DOM.closeLightboxBtn) DOM.closeLightboxBtn.addEventListener('click', closeLightbox);

    if (DOM.lightboxZoomInBtn) {
      DOM.lightboxZoomInBtn.addEventListener('click', () => setLightboxZoom(state.lightboxZoom + 0.25));
    }

    if (DOM.lightboxZoomOutBtn) {
      DOM.lightboxZoomOutBtn.addEventListener('click', () => setLightboxZoom(state.lightboxZoom - 0.25));
    }

    if (DOM.lightboxResetBtn) {
      DOM.lightboxResetBtn.addEventListener('click', () => {
        state.lightboxZoom = 1;
        state.lightboxPanX = 0;
        state.lightboxPanY = 0;
        updateLightboxTransform();
      });
    }

    if (DOM.lightboxDownloadBtn) {
      DOM.lightboxDownloadBtn.addEventListener('click', () => {
        if (!DOM.lightboxImg || !DOM.lightboxImg.src) return;
        const a = document.createElement('a');
        a.href = DOM.lightboxImg.src;
        a.download = `NathKhat_Study_Image_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    }

    // Lightbox Stage Wheel Zoom
    if (DOM.lightboxStage) {
      DOM.lightboxStage.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setLightboxZoom(state.lightboxZoom + delta);
      }, { passive: false });

      // Lightbox Pan / Drag
      DOM.lightboxStage.addEventListener('mousedown', (e) => {
        if (e.target === DOM.lightboxImg || e.target === DOM.lightboxStage) {
          state.lightboxDragging = true;
          state.lightboxDragStart = { x: e.clientX - state.lightboxPanX, y: e.clientY - state.lightboxPanY };
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (state.lightboxDragging && state.lightboxOpen) {
          state.lightboxPanX = e.clientX - state.lightboxDragStart.x;
          state.lightboxPanY = e.clientY - state.lightboxDragStart.y;
          updateLightboxTransform();
        }
      });

      window.addEventListener('mouseup', () => {
        state.lightboxDragging = false;
      });
    }

    // Close on Escape Key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.lightboxOpen) closeLightbox();
        else if (state.isOpen) closeCropper();
      }
    });
  }

  function openLightbox(src, alt) {
    if (!DOM.lightbox || !DOM.lightboxImg) return;
    DOM.lightboxImg.src = src;
    DOM.lightboxImg.alt = alt || '';
    state.lightboxZoom = 1;
    state.lightboxPanX = 0;
    state.lightboxPanY = 0;
    updateLightboxTransform();
    DOM.lightbox.classList.add('open');
    state.lightboxOpen = true;
  }

  function closeLightbox() {
    if (DOM.lightbox) {
      DOM.lightbox.classList.remove('open');
    }
    state.lightboxOpen = false;
  }

  function setLightboxZoom(val) {
    state.lightboxZoom = Math.min(Math.max(val, 0.4), 6.0);
    updateLightboxTransform();
  }

  function updateLightboxTransform() {
    if (!DOM.lightboxImg) return;
    DOM.lightboxImg.style.transform = `translate(${state.lightboxPanX}px, ${state.lightboxPanY}px) scale(${state.lightboxZoom})`;
    if (DOM.lightboxZoomLevel) {
      DOM.lightboxZoomLevel.textContent = `${Math.round(state.lightboxZoom * 100)}%`;
    }
  }

  // Window Resize Adaptation
  window.addEventListener('resize', () => {
    if (state.isOpen) {
      calculateStageGeometry();
      updateTransform();
      updateCropBox();
    }
  });

  // Public API
  return {
    init,
    openCropper,
    closeCropper,
    openLightbox,
    closeLightbox
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ImageCropper.init);
} else {
  ImageCropper.init();
}
