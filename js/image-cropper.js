/**
 * NathKhat - High-Performance Image Studio, Crop, Recolor & Annotation Engine
 * Features:
 * - Word-like Screen Clipping (Capture Screen/Window or Win+Shift+S Clipboard Snip)
 * - Color Tuning & Recolor (Presets: B&W Grayscale, Sepia, Invert/Dark, Warm, Cool, High Contrast)
 * - Color Tint / Wash with custom color picker & intensity slider
 * - Brightness, Contrast, Saturation, and Hue adjustment sliders
 * - Drawing & Markup Tools (Pen, Highlighter, Arrow, Box, Text in any color with undo)
 * - Freeform & Preset Aspect Ratio Cropping (Free, 1:1, 4:3, 16:9, Original)
 * - Smooth Zoom Slider, Wheel & Touch Pinch (without +/- buttons)
 * - Rotations & Flips
 * - In-Editor Re-Editing via Floating Bubble
 * - Fullscreen Zoom Lightbox
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

    // Active Mode Tab: 'crop' | 'color' | 'draw'
    activeTab: 'crop',

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

    // Color Adjustments & Recolor State
    presetFilter: 'normal',
    recolorTint: 'none',
    tintIntensity: 45,
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hue: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,

    // Drawing & Markup State
    drawTool: 'pen',
    drawColor: '#ef4444',
    drawSize: 4,
    drawHistory: [],
    isDrawing: false,
    drawStartX: 0,
    drawStartY: 0,
    currentPath: [],

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
    bindTabEvents();
    bindColorEvents();
    bindDrawEvents();
    bindScreenClipEvents();
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
      drawCanvas: document.getElementById('cropperDrawCanvas'),
      colorOverlay: document.getElementById('cropperColorOverlay'),
      box: document.getElementById('cropperBox'),
      dimsBadge: document.getElementById('cropperDimsBadge'),

      // Tabs
      tabNav: document.getElementById('cropperTabNav'),
      tabPanels: {
        crop: document.getElementById('tabPanelCrop'),
        color: document.getElementById('tabPanelColor'),
        draw: document.getElementById('tabPanelDraw')
      },

      // Zoom Controls (Slider & Fit - strictly NO +/- buttons)
      zoomSlider: document.getElementById('cropperZoomSlider'),
      zoomFitBtn: document.getElementById('cropperZoomFitBtn'),
      zoomVal: document.getElementById('cropperZoomVal'),

      // Aspect Ratio & Transforms
      ratioGroup: document.getElementById('cropperRatioGroup'),
      rotateLeftBtn: document.getElementById('cropperRotateLeftBtn'),
      rotateRightBtn: document.getElementById('cropperRotateRightBtn'),
      flipHBtn: document.getElementById('cropperFlipHBtn'),
      flipVBtn: document.getElementById('cropperFlipVBtn'),
      resetBtn: document.getElementById('cropperResetBtn'),

      // Color Controls
      filterPresets: document.getElementById('cropperFilterPresets'),
      recolorSwatches: document.getElementById('recolorSwatches'),
      colorTintPicker: document.getElementById('cropperColorTintPicker'),
      tintIntensity: document.getElementById('cropperTintIntensity'),
      brightnessSlider: document.getElementById('cropperBrightness'),
      contrastSlider: document.getElementById('cropperContrast'),
      saturateSlider: document.getElementById('cropperSaturate'),
      hueSlider: document.getElementById('cropperHue'),
      valBrightness: document.getElementById('valBrightness'),
      valContrast: document.getElementById('valContrast'),
      valSaturate: document.getElementById('valSaturate'),
      valHue: document.getElementById('valHue'),
      resetColorsBtn: document.getElementById('cropperResetColorsBtn'),

      // Draw Controls
      drawToolsGroup: document.getElementById('drawToolsGroup'),
      drawColorsGroup: document.getElementById('drawColorsGroup'),
      drawColorPicker: document.getElementById('cropperDrawColorPicker'),
      drawSize: document.getElementById('cropperDrawSize'),
      undoDrawBtn: document.getElementById('cropperUndoDrawBtn'),
      clearDrawBtn: document.getElementById('cropperClearDrawBtn'),

      // Action Buttons
      skipBtn: document.getElementById('cropperSkipBtn'),
      cancelBtn: document.getElementById('cancelCropperBtn'),
      applyBtn: document.getElementById('applyCropBtn'),

      // Screen Clip Modal
      screenClipModal: document.getElementById('screenClipModal'),
      closeScreenClipBtn: document.getElementById('closeScreenClipModalBtn'),
      cancelScreenClipBtn: document.getElementById('cancelScreenClipBtn'),
      startLiveCaptureBtn: document.getElementById('startLiveCaptureBtn'),
      pasteFromClipboardBtn: document.getElementById('pasteFromClipboardBtn'),
      screenClipDropZone: document.getElementById('screenClipDropZone'),

      // Lightbox
      lightbox: document.getElementById('imageLightboxModal'),
      lightboxStage: document.getElementById('lightboxStage'),
      lightboxImg: document.getElementById('lightboxImg'),
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
   * Opens Image Studio with instant preview
   * @param {File|Blob|string} source - File, Blob or Image URL
   * @param {HTMLElement} [targetEditor] - Active contenteditable container
   * @param {HTMLImageElement} [targetImg] - Existing image if re-cropping/re-coloring
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
    state.aspectRatio = null;

    // Reset color states unless re-editing
    if (!targetImg) {
      resetColors();
      clearDrawings();
    }

    // Switch to Crop tab by default
    switchTab('crop');

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

    // Fast Image Load into Studio
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

      // Initialize draw canvas resolution
      if (DOM.drawCanvas) {
        DOM.drawCanvas.width = state.naturalW;
        DOM.drawCanvas.height = state.naturalH;
        redrawAllDrawings();
      }

      // Display Modal first so stage has bounding dimensions
      if (DOM.modal) {
        DOM.modal.classList.add('open');
        state.isOpen = true;
      }

      // Update color live preview
      updateColorPreview();

      // Compute geometries with requestAnimationFrame
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
    state.isDrawing = false;

    if (state.objectUrlToRevoke) {
      URL.revokeObjectURL(state.objectUrlToRevoke);
      state.objectUrlToRevoke = null;
    }
  }

  /* ==========================================================================
     Tab Navigation (Crop, Color, Draw)
     ========================================================================== */

  function bindTabEvents() {
    if (!DOM.tabNav) return;

    DOM.tabNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.cropper-tab-btn');
      if (!btn) return;
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  }

  function switchTab(tab) {
    state.activeTab = tab;

    // Update Tab Buttons
    if (DOM.tabNav) {
      DOM.tabNav.querySelectorAll('.cropper-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
      });
    }

    // Update Panels
    Object.keys(DOM.tabPanels).forEach(key => {
      const panel = DOM.tabPanels[key];
      if (panel) {
        panel.style.display = (key === tab) ? 'block' : 'none';
      }
    });

    // Toggle Stage Interaction & Box Visibility
    if (DOM.box) {
      // In Draw mode, soften or hide crop box outline so drawing is fully clear
      if (tab === 'draw') {
        DOM.box.style.pointerEvents = 'none';
        DOM.box.style.borderColor = 'rgba(99, 102, 241, 0.35)';
      } else {
        DOM.box.style.pointerEvents = 'auto';
        DOM.box.style.borderColor = '#6366f1';
      }
    }

    if (DOM.drawCanvas) {
      DOM.drawCanvas.style.pointerEvents = (tab === 'draw') ? 'auto' : 'none';
      DOM.drawCanvas.style.cursor = (tab === 'draw') ? 'crosshair' : 'default';
    }

    if (DOM.stage) {
      DOM.stage.style.cursor = (tab === 'draw') ? 'crosshair' : (tab === 'crop' ? 'grab' : 'default');
    }
  }

  /* ==========================================================================
     Cropper Geometry & Rendering Math
     ========================================================================== */

  function calculateStageGeometry() {
    if (!DOM.stage || !state.naturalW || !state.naturalH) return;

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

    // Initialize Crop Box to cover 88% of image, centered
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

    const transformStr = `translate(${state.panX}px, ${state.panY}px) rotate(${state.rotation}deg) scale(${state.zoom * state.flipH}, ${state.zoom * state.flipV})`;
    DOM.canvasWrap.style.transform = transformStr;

    // Update Zoom slider & value text
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

    // Compute pixel resolution of the cropped area
    if (DOM.dimsBadge && state.baseScale > 0) {
      const realW = Math.round(state.cropBox.width / (state.baseScale * state.zoom));
      const realH = Math.round(state.cropBox.height / (state.baseScale * state.zoom));
      DOM.dimsBadge.textContent = `${realW} × ${realH} px`;
    }
  }

  /* ==========================================================================
     Cropper Event Listeners (Zoom, Rotate, Pan, Crop Resize)
     ========================================================================== */

  function bindCropperEvents() {
    if (!DOM.stage) return;

    if (DOM.closeBtn) DOM.closeBtn.addEventListener('click', closeCropper);
    if (DOM.cancelBtn) DOM.cancelBtn.addEventListener('click', closeCropper);
    if (DOM.applyBtn) DOM.applyBtn.addEventListener('click', applyCropAndInsert);
    if (DOM.skipBtn) DOM.skipBtn.addEventListener('click', skipCropAndInsert);

    // Zoom Controls: Smooth Slider (No +/- buttons)
    if (DOM.zoomSlider) {
      DOM.zoomSlider.addEventListener('input', (e) => {
        setZoom(parseInt(e.target.value, 10) / 100);
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

    // Adapt current crop box to maintain aspect ratio
    let newW = state.cropBox.width;
    let newH = Math.round(newW / targetRatio);

    const stageRect = DOM.stage.getBoundingClientRect();
    if (newH > stageRect.height - 20) {
      newH = stageRect.height - 20;
      newW = Math.round(newH * targetRatio);
    }

    state.cropBox.width = Math.max(newW, 40);
    state.cropBox.height = Math.max(newH, 40);
    updateCropBox();
  }

  function onPointerDown(e) {
    if (!state.isOpen) return;

    // If Draw tab is active, let draw handlers manage interaction
    if (state.activeTab === 'draw') {
      return;
    }

    const handleEl = e.target.closest('.cropper-handle');
    const isBox = e.target.closest('.cropper-box');

    state.isInteracting = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;

    if (handleEl) {
      state.activeHandle = handleEl.getAttribute('data-handle');
      state.boxStartX = state.cropBox.x;
      state.boxStartY = state.cropBox.y;
      state.boxStartW = state.cropBox.width;
      state.boxStartH = state.cropBox.height;
      e.preventDefault();
    } else if (isBox) {
      state.isDraggingBox = true;
      state.boxStartX = state.cropBox.x;
      state.boxStartY = state.cropBox.y;
      e.preventDefault();
    } else {
      // Pan image
      state.isPanning = true;
      state.panStartX = state.panX;
      state.panStartY = state.panY;
      e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (!state.isInteracting || !state.isOpen || state.activeTab === 'draw') return;

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
        if (ratio) {
          h = Math.round(w / ratio);
          y = state.boxStartY + (state.boxStartH - h) / 2;
        }
        x = state.boxStartX + (state.boxStartW - w);
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
        if (ratio) {
          w = Math.round(h * ratio);
          x = state.boxStartX + (state.boxStartW - w) / 2;
        }
        y = state.boxStartY + (state.boxStartH - h);
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
    } else if (e.touches.length === 1 && state.activeTab !== 'draw') {
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
    } else if (e.touches.length === 1 && state.activeTab !== 'draw') {
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
     Color & Recolor Engine (Word-like Picture Color, Tints & Filters)
     ========================================================================== */

  function bindColorEvents() {
    // 1. Filter Presets (Normal, Grayscale B&W, Sepia, Invert, Warm, Cool, High Contrast)
    if (DOM.filterPresets) {
      DOM.filterPresets.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ratio');
        if (!btn) return;
        DOM.filterPresets.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.getAttribute('data-preset');
        applyColorPreset(preset);
      });
    }

    // 2. Recolor Swatches (Blue, Red, Green, Purple, Amber, Rose, Cyan, None)
    if (DOM.recolorSwatches) {
      DOM.recolorSwatches.addEventListener('click', (e) => {
        const btn = e.target.closest('.swatch-btn');
        if (!btn) return;
        DOM.recolorSwatches.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.recolorTint = btn.getAttribute('data-tint');
        updateColorPreview();
      });
    }

    // Custom Color Tint Picker
    if (DOM.colorTintPicker) {
      DOM.colorTintPicker.addEventListener('input', (e) => {
        state.recolorTint = e.target.value;
        if (DOM.recolorSwatches) {
          DOM.recolorSwatches.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        }
        updateColorPreview();
      });
    }

    // Tint Intensity
    if (DOM.tintIntensity) {
      DOM.tintIntensity.addEventListener('input', (e) => {
        state.tintIntensity = parseInt(e.target.value, 10) || 45;
        updateColorPreview();
      });
    }

    // Fine Adjustment Sliders
    const sliders = [
      { el: DOM.brightnessSlider, prop: 'brightness', valEl: DOM.valBrightness, unit: '%' },
      { el: DOM.contrastSlider, prop: 'contrast', valEl: DOM.valContrast, unit: '%' },
      { el: DOM.saturateSlider, prop: 'saturate', valEl: DOM.valSaturate, unit: '%' },
      { el: DOM.hueSlider, prop: 'hue', valEl: DOM.valHue, unit: '°' }
    ];

    sliders.forEach(({ el, prop, valEl, unit }) => {
      if (!el) return;
      el.addEventListener('input', (e) => {
        state[prop] = parseInt(e.target.value, 10);
        if (valEl) valEl.textContent = `${state[prop]}${unit}`;
        updateColorPreview();
      });
    });

    // Reset Colors Button
    if (DOM.resetColorsBtn) {
      DOM.resetColorsBtn.addEventListener('click', resetColors);
    }
  }

  function applyColorPreset(preset) {
    state.presetFilter = preset;

    // Reset basics
    state.grayscale = 0;
    state.sepia = 0;
    state.invert = 0;
    state.brightness = 100;
    state.contrast = 100;
    state.saturate = 100;
    state.hue = 0;

    switch (preset) {
      case 'grayscale':
        state.grayscale = 100;
        state.contrast = 115;
        break;
      case 'sepia':
        state.sepia = 90;
        state.contrast = 105;
        break;
      case 'invert':
        state.invert = 100;
        break;
      case 'high-contrast':
        state.contrast = 165;
        state.brightness = 105;
        state.saturate = 125;
        break;
      case 'warm':
        state.sepia = 30;
        state.saturate = 135;
        state.hue = 15;
        break;
      case 'cool':
        state.hue = 195;
        state.saturate = 120;
        state.brightness = 102;
        break;
      default:
        // normal
        break;
    }

    // Sync sliders UI
    if (DOM.brightnessSlider) DOM.brightnessSlider.value = state.brightness;
    if (DOM.contrastSlider) DOM.contrastSlider.value = state.contrast;
    if (DOM.saturateSlider) DOM.saturateSlider.value = state.saturate;
    if (DOM.hueSlider) DOM.hueSlider.value = state.hue;

    if (DOM.valBrightness) DOM.valBrightness.textContent = `${state.brightness}%`;
    if (DOM.valContrast) DOM.valContrast.textContent = `${state.contrast}%`;
    if (DOM.valSaturate) DOM.valSaturate.textContent = `${state.saturate}%`;
    if (DOM.valHue) DOM.valHue.textContent = `${state.hue}°`;

    updateColorPreview();
  }

  function resetColors() {
    state.presetFilter = 'normal';
    state.recolorTint = 'none';
    state.tintIntensity = 45;
    state.brightness = 100;
    state.contrast = 100;
    state.saturate = 100;
    state.hue = 0;
    state.grayscale = 0;
    state.sepia = 0;
    state.invert = 0;

    if (DOM.filterPresets) {
      DOM.filterPresets.querySelectorAll('.btn-ratio').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-preset') === 'normal');
      });
    }

    if (DOM.recolorSwatches) {
      DOM.recolorSwatches.querySelectorAll('.swatch-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tint') === 'none');
      });
    }

    if (DOM.brightnessSlider) DOM.brightnessSlider.value = 100;
    if (DOM.contrastSlider) DOM.contrastSlider.value = 100;
    if (DOM.saturateSlider) DOM.saturateSlider.value = 100;
    if (DOM.hueSlider) DOM.hueSlider.value = 0;
    if (DOM.tintIntensity) DOM.tintIntensity.value = 45;

    if (DOM.valBrightness) DOM.valBrightness.textContent = '100%';
    if (DOM.valContrast) DOM.valContrast.textContent = '100%';
    if (DOM.valSaturate) DOM.valSaturate.textContent = '100%';
    if (DOM.valHue) DOM.valHue.textContent = '0°';

    updateColorPreview();
  }

  function updateColorPreview() {
    if (!DOM.sourceImg) return;

    // Compose CSS filter
    let f = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturate}%) hue-rotate(${state.hue}deg)`;
    if (state.grayscale > 0) f += ` grayscale(${state.grayscale}%)`;
    if (state.sepia > 0) f += ` sepia(${state.sepia}%)`;
    if (state.invert > 0) f += ` invert(${state.invert}%)`;

    DOM.sourceImg.style.filter = f;

    // Recolor overlay wash
    if (DOM.colorOverlay) {
      if (state.recolorTint && state.recolorTint !== 'none') {
        DOM.colorOverlay.style.display = 'block';
        DOM.colorOverlay.style.backgroundColor = state.recolorTint;
        DOM.colorOverlay.style.opacity = (state.tintIntensity / 100).toString();
      } else {
        DOM.colorOverlay.style.display = 'none';
      }
    }
  }

  /* ==========================================================================
     Draw & Markup Engine (Pen, Highlighter, Arrow, Box, Text)
     ========================================================================== */

  function bindDrawEvents() {
    // Tool buttons (Pen, Highlighter, Arrow, Box, Text)
    if (DOM.drawToolsGroup) {
      DOM.drawToolsGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-draw-tool');
        if (!btn) return;
        DOM.drawToolsGroup.querySelectorAll('.btn-draw-tool').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.drawTool = btn.getAttribute('data-tool');
      });
    }

    // Color Swatches
    if (DOM.drawColorsGroup) {
      DOM.drawColorsGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.swatch-btn');
        if (!btn) return;
        DOM.drawColorsGroup.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.drawColor = btn.getAttribute('data-color');
      });
    }

    // Custom Color Picker
    if (DOM.drawColorPicker) {
      DOM.drawColorPicker.addEventListener('input', (e) => {
        state.drawColor = e.target.value;
        if (DOM.drawColorsGroup) {
          DOM.drawColorsGroup.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        }
      });
    }

    // Size Selector
    if (DOM.drawSize) {
      DOM.drawSize.addEventListener('change', (e) => {
        state.drawSize = parseInt(e.target.value, 10) || 4;
      });
    }

    // Undo & Clear Buttons
    if (DOM.undoDrawBtn) DOM.undoDrawBtn.addEventListener('click', undoLastDrawing);
    if (DOM.clearDrawBtn) DOM.clearDrawBtn.addEventListener('click', clearDrawings);

    // Canvas Pointer Drawing Listeners
    if (DOM.stage) {
      DOM.stage.addEventListener('mousedown', onDrawStart);
      DOM.stage.addEventListener('mousemove', onDrawMove);
      DOM.stage.addEventListener('mouseup', onDrawEnd);

      DOM.stage.addEventListener('touchstart', onTouchDrawStart, { passive: false });
      DOM.stage.addEventListener('touchmove', onTouchDrawMove, { passive: false });
      DOM.stage.addEventListener('touchend', onTouchDrawEnd);
    }
  }

  /**
   * Transforms stage click coordinates into untransformed image canvas pixels
   */
  function stageToCanvasCoords(clientX, clientY) {
    if (!DOM.stage || !state.naturalW || !state.naturalH) return { x: 0, y: 0 };

    const stageRect = DOM.stage.getBoundingClientRect();
    const stageX = clientX - stageRect.left;
    const stageY = clientY - stageRect.top;

    // Relative to image center in stage
    const dx = stageX - (state.imgCenterX + state.panX);
    const dy = stageY - (state.imgCenterY + state.panY);

    // Un-rotate
    const rad = (-state.rotation * Math.PI) / 180;
    const unrotX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const unrotY = dx * Math.sin(rad) + dy * Math.cos(rad);

    // Un-scale (zoom and flips)
    const unscaleX = unrotX / (state.zoom * state.flipH);
    const unscaleY = unrotY / (state.zoom * state.flipV);

    // Map to natural image dimensions
    const canvasX = (unscaleX + state.displayWidth / 2) * (state.naturalW / state.displayWidth);
    const canvasY = (unscaleY + state.displayHeight / 2) * (state.naturalH / state.displayHeight);

    return {
      x: Math.round(canvasX),
      y: Math.round(canvasY)
    };
  }

  function onDrawStart(e) {
    if (state.activeTab !== 'draw' || !state.isOpen) return;
    e.preventDefault();

    const pt = stageToCanvasCoords(e.clientX, e.clientY);
    state.isDrawing = true;
    state.drawStartX = pt.x;
    state.drawStartY = pt.y;

    if (state.drawTool === 'text') {
      state.isDrawing = false;
      const text = prompt('Enter annotation text to place on image:');
      if (text && text.trim()) {
        state.drawHistory.push({
          tool: 'text',
          text: text.trim(),
          x: pt.x,
          y: pt.y,
          color: state.drawColor,
          size: state.drawSize
        });
        redrawAllDrawings();
      }
      return;
    }

    state.currentPath = [pt];
  }

  function onDrawMove(e) {
    if (!state.isDrawing || state.activeTab !== 'draw') return;
    e.preventDefault();

    const pt = stageToCanvasCoords(e.clientX, e.clientY);

    if (state.drawTool === 'pen' || state.drawTool === 'highlighter') {
      state.currentPath.push(pt);
      renderLiveStroke();
    } else if (state.drawTool === 'arrow' || state.drawTool === 'rect') {
      renderLiveShape(pt);
    }
  }

  function onDrawEnd(e) {
    if (!state.isDrawing || state.activeTab !== 'draw') return;
    state.isDrawing = false;

    const pt = e.clientX ? stageToCanvasCoords(e.clientX, e.clientY) : state.currentPath[state.currentPath.length - 1];

    if (state.drawTool === 'pen' || state.drawTool === 'highlighter') {
      if (state.currentPath.length > 0) {
        state.drawHistory.push({
          tool: state.drawTool,
          path: state.currentPath,
          color: state.drawColor,
          size: state.drawSize
        });
      }
    } else if (state.drawTool === 'arrow') {
      state.drawHistory.push({
        tool: 'arrow',
        fromX: state.drawStartX,
        fromY: state.drawStartY,
        toX: pt.x,
        toY: pt.y,
        color: state.drawColor,
        size: state.drawSize
      });
    } else if (state.drawTool === 'rect') {
      state.drawHistory.push({
        tool: 'rect',
        x: Math.min(state.drawStartX, pt.x),
        y: Math.min(state.drawStartY, pt.y),
        w: Math.abs(pt.x - state.drawStartX),
        h: Math.abs(pt.y - state.drawStartY),
        color: state.drawColor,
        size: state.drawSize
      });
    }

    state.currentPath = [];
    redrawAllDrawings();
  }

  function onTouchDrawStart(e) {
    if (state.activeTab !== 'draw' || e.touches.length !== 1) return;
    const touch = e.touches[0];
    onDrawStart({
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault()
    });
  }

  function onTouchDrawMove(e) {
    if (state.activeTab !== 'draw' || e.touches.length !== 1) return;
    const touch = e.touches[0];
    onDrawMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault()
    });
  }

  function onTouchDrawEnd(e) {
    if (state.activeTab !== 'draw') return;
    onDrawEnd(e);
  }

  function renderLiveStroke() {
    if (!DOM.drawCanvas || state.currentPath.length < 2) return;
    const ctx = DOM.drawCanvas.getContext('2d');
    const scale = state.naturalW / (state.displayWidth || 1);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (state.drawTool === 'highlighter') {
      ctx.strokeStyle = state.drawColor;
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = state.drawSize * 3.5 * scale;
      ctx.globalCompositeOperation = 'multiply';
    } else {
      ctx.strokeStyle = state.drawColor;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = state.drawSize * scale;
      ctx.globalCompositeOperation = 'source-over';
    }

    const p1 = state.currentPath[state.currentPath.length - 2];
    const p2 = state.currentPath[state.currentPath.length - 1];

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }

  function renderLiveShape(currPt) {
    redrawAllDrawings();
    if (!DOM.drawCanvas) return;
    const ctx = DOM.drawCanvas.getContext('2d');
    const scale = state.naturalW / (state.displayWidth || 1);

    ctx.save();
    ctx.strokeStyle = state.drawColor;
    ctx.fillStyle = state.drawColor;
    ctx.lineWidth = state.drawSize * scale;

    if (state.drawTool === 'arrow') {
      drawArrowOnContext(ctx, state.drawStartX, state.drawStartY, currPt.x, currPt.y, state.drawColor, state.drawSize * scale);
    } else if (state.drawTool === 'rect') {
      const x = Math.min(state.drawStartX, currPt.x);
      const y = Math.min(state.drawStartY, currPt.y);
      const w = Math.abs(currPt.x - state.drawStartX);
      const h = Math.abs(currPt.y - state.drawStartY);
      ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
  }

  function redrawAllDrawings() {
    if (!DOM.drawCanvas) return;
    const ctx = DOM.drawCanvas.getContext('2d');
    ctx.clearRect(0, 0, DOM.drawCanvas.width, DOM.drawCanvas.height);

    const scale = state.naturalW / (state.displayWidth || 1);

    state.drawHistory.forEach(item => {
      ctx.save();
      const itemWidth = (item.size || 4) * scale;
      ctx.strokeStyle = item.color || '#ef4444';
      ctx.fillStyle = item.color || '#ef4444';

      if (item.tool === 'pen') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = itemWidth;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        item.path.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      } else if (item.tool === 'highlighter') {
        ctx.lineCap = 'square';
        ctx.lineJoin = 'round';
        ctx.lineWidth = itemWidth * 3.5;
        ctx.globalAlpha = 0.38;
        ctx.globalCompositeOperation = 'multiply';
        ctx.beginPath();
        item.path.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      } else if (item.tool === 'arrow') {
        drawArrowOnContext(ctx, item.fromX, item.fromY, item.toX, item.toY, item.color, itemWidth);
      } else if (item.tool === 'rect') {
        ctx.lineWidth = itemWidth;
        ctx.strokeRect(item.x, item.y, item.w, item.h);
      } else if (item.tool === 'text') {
        const fontSize = Math.max(Math.round(itemWidth * 5), 18);
        ctx.font = `bold ${fontSize}px sans-serif`;
        // Draw shadow/halo for visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeText(item.text, item.x, item.y);
        ctx.fillText(item.text, item.x, item.y);
      }
      ctx.restore();
    });
  }

  function drawArrowOnContext(ctx, fromX, fromY, toX, toY, color, width) {
    const headLen = Math.max(width * 3.5, 14);
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function undoLastDrawing() {
    if (state.drawHistory.length > 0) {
      state.drawHistory.pop();
      redrawAllDrawings();
    }
  }

  function clearDrawings() {
    state.drawHistory = [];
    if (DOM.drawCanvas) {
      const ctx = DOM.drawCanvas.getContext('2d');
      ctx.clearRect(0, 0, DOM.drawCanvas.width, DOM.drawCanvas.height);
    }
  }

  /* ==========================================================================
     Word-like Screen Clipping Feature
     ========================================================================== */

  function bindScreenClipEvents() {
    if (DOM.closeScreenClipBtn) DOM.closeScreenClipBtn.addEventListener('click', closeScreenClipModal);
    if (DOM.cancelScreenClipBtn) DOM.cancelScreenClipBtn.addEventListener('click', closeScreenClipModal);

    // Option 1: Live Screen Capture
    if (DOM.startLiveCaptureBtn) {
      DOM.startLiveCaptureBtn.addEventListener('click', () => {
        closeScreenClipModal();
        captureLiveScreen(state.targetEditor);
      });
    }

    // Option 2: Paste from Clipboard Button
    if (DOM.pasteFromClipboardBtn) {
      DOM.pasteFromClipboardBtn.addEventListener('click', async () => {
        const readSuccess = await tryReadClipboardImage(state.targetEditor);
        if (readSuccess) {
          closeScreenClipModal();
        } else {
          if (typeof window.showToast === 'function') {
            window.showToast('Clip any window with Win + Shift + S, then press Ctrl + V here!', 'info');
          }
        }
      });
    }

    // Drop Zone Paste / Drop Handler
    if (DOM.screenClipDropZone) {
      DOM.screenClipDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.screenClipDropZone.classList.add('drag-over-active');
      });
      DOM.screenClipDropZone.addEventListener('dragleave', () => {
        DOM.screenClipDropZone.classList.remove('drag-over-active');
      });
      DOM.screenClipDropZone.addEventListener('drop', (e) => {
        DOM.screenClipDropZone.classList.remove('drag-over-active');
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          for (let f of files) {
            if (f.type.startsWith('image/')) {
              closeScreenClipModal();
              openCropper(f, state.targetEditor);
              break;
            }
          }
        }
      });
    }
  }

  /**
   * Primary entry point when user clicks "✂️ Screen Clip" in editor toolbar
   */
  async function startScreenClipping(targetEditor) {
    state.targetEditor = targetEditor;

    // Check if Screen Capture API is supported
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
      try {
        await captureLiveScreen(targetEditor);
        return;
      } catch (err) {
        // User cancelled or browser rejected
        if (err.name === 'NotAllowedError' && !err.message.toLowerCase().includes('denied')) {
          // User simply closed the picker modal, don't show error
          return;
        }
      }
    }

    // If live capture unavailable or errored, try clipboard or open friendly guide modal
    const pasted = await tryReadClipboardImage(targetEditor);
    if (!pasted) {
      openScreenClipModal(targetEditor);
    }
  }

  async function captureLiveScreen(targetEditor) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      openScreenClipModal(targetEditor);
      return;
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        cursor: 'always'
      },
      audio: false
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    await video.play();

    // Allow frame rendering
    await new Promise(r => setTimeout(r, 220));

    const vW = video.videoWidth || 1920;
    const vH = video.videoHeight || 1080;

    const canvas = document.createElement('canvas');
    canvas.width = vW;
    canvas.height = vH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, vW, vH);

    // Immediately terminate screen sharing
    stream.getTracks().forEach(t => t.stop());
    video.srcObject = null;

    canvas.toBlob(blob => {
      if (blob) {
        openCropper(blob, targetEditor);
        if (typeof window.showToast === 'function') {
          window.showToast('✂️ Screen clipping captured! Drag the crop box or edit colors.', 'success');
        }
      }
    }, 'image/png');
  }

  async function tryReadClipboardImage(targetEditor) {
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              openCropper(blob, targetEditor);
              if (typeof window.showToast === 'function') {
                window.showToast('📋 Clipboard screen clip loaded into editor!', 'success');
              }
              return true;
            }
          }
        }
      } catch (e) {
        // Clipboard read permission denied or no image
      }
    }
    return false;
  }

  function openScreenClipModal(targetEditor) {
    state.targetEditor = targetEditor;
    if (DOM.screenClipModal) {
      DOM.screenClipModal.classList.add('open');
    }
  }

  function closeScreenClipModal() {
    if (DOM.screenClipModal) {
      DOM.screenClipModal.classList.remove('open');
    }
  }

  /* ==========================================================================
     Canvas Crop Rendering & Output Generation (With Baked Colors & Markups)
     ========================================================================== */

  function applyCropAndInsert() {
    if (!state.sourceImg || !state.sourceImg.complete) return;

    try {
      // Calculate output canvas size based on real original image pixels
      const scaleFactor = 1 / (state.baseScale * state.zoom);
      const rawCroppedW = Math.round(state.cropBox.width * scaleFactor);
      const rawCroppedH = Math.round(state.cropBox.height * scaleFactor);

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
      ctx.imageSmoothingQuality = 'high';

      const isPng = (state.sourceUrl && (state.sourceUrl.includes('.png') || state.sourceUrl.includes('image/png')));
      if (!isPng) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
        ctx.restore();
      }

      // Mathematical mapping from Stage coordinates to Output Canvas
      const stageToCanvas = outW / state.cropBox.width;

      ctx.save();
      ctx.scale(stageToCanvas, stageToCanvas);
      ctx.translate(-state.cropBox.x, -state.cropBox.y);

      // Apply image position & transforms in stage coordinates
      const cx = state.imgCenterX + state.panX;
      const cy = state.imgCenterY + state.panY;

      ctx.translate(cx, cy);
      ctx.rotate((state.rotation * Math.PI) / 180);
      ctx.scale(state.zoom * state.flipH, state.zoom * state.flipV);

      // 1. Apply Color Filters directly to Canvas context
      let filterStr = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturate}%) hue-rotate(${state.hue}deg)`;
      if (state.grayscale > 0) filterStr += ` grayscale(${state.grayscale}%)`;
      if (state.sepia > 0) filterStr += ` sepia(${state.sepia}%)`;
      if (state.invert > 0) filterStr += ` invert(${state.invert}%)`;

      ctx.filter = filterStr;

      // Draw source image centered
      ctx.drawImage(
        state.sourceImg,
        -state.displayWidth / 2,
        -state.displayHeight / 2,
        state.displayWidth,
        state.displayHeight
      );

      ctx.filter = 'none';

      // 2. Apply Recolor Tint layer if active
      if (state.recolorTint && state.recolorTint !== 'none') {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.globalAlpha = state.tintIntensity / 100;
        ctx.fillStyle = state.recolorTint;
        ctx.fillRect(
          -state.displayWidth / 2,
          -state.displayHeight / 2,
          state.displayWidth,
          state.displayHeight
        );
        ctx.restore();
      }

      // 3. Draw Annotations & Markups on top
      if (DOM.drawCanvas && state.drawHistory.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.drawImage(
          DOM.drawCanvas,
          -state.displayWidth / 2,
          -state.displayHeight / 2,
          state.displayWidth,
          state.displayHeight
        );
        ctx.restore();
      }

      ctx.restore();

      // Export as high-quality web data URL
      const mimeType = isPng ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.88);

      insertResultIntoEditor(dataUrl);
      closeCropper();

      if (typeof window.showToast === 'function') {
        window.showToast('🎨 Image edited & inserted successfully!', 'success');
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

      // Color filter
      let filterStr = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturate}%) hue-rotate(${state.hue}deg)`;
      if (state.grayscale > 0) filterStr += ` grayscale(${state.grayscale}%)`;
      if (state.sepia > 0) filterStr += ` sepia(${state.sepia}%)`;
      if (state.invert > 0) filterStr += ` invert(${state.invert}%)`;
      ctx.filter = filterStr;

      // Transforms
      if (state.rotation !== 0 || state.flipH !== 1 || state.flipV !== 1) {
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate((state.rotation * Math.PI) / 180);
        ctx.scale(state.flipH, state.flipV);
        ctx.drawImage(state.sourceImg, -outW / 2, -outH / 2, outW, outH);
      } else {
        ctx.drawImage(state.sourceImg, 0, 0, outW, outH);
      }

      ctx.filter = 'none';

      // Tint overlay
      if (state.recolorTint && state.recolorTint !== 'none') {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.globalAlpha = state.tintIntensity / 100;
        ctx.fillStyle = state.recolorTint;
        ctx.fillRect(0, 0, outW, outH);
        ctx.restore();
      }

      // Drawings
      if (DOM.drawCanvas && state.drawHistory.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(DOM.drawCanvas, 0, 0, outW, outH);
        ctx.restore();
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

    // If re-editing an existing image in the editor
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
     Global Clipboard Paste & Drag-and-Drop
     ========================================================================== */

  function bindGlobalPasteAndDrop() {
    window.addEventListener('paste', (e) => {
      const activeEl = document.activeElement;
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

            let targetEditor = null;
            if (activeEl && activeEl.classList.contains('editor-content-area')) {
              targetEditor = activeEl;
            }

            openCropper(blob, targetEditor);
            if (typeof window.showToast === 'function') {
              window.showToast('📋 Clipped image loaded into Image Studio!', 'info');
            }
            break;
          }
        }
      }
    }, true);

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

    document.addEventListener('click', (e) => {
      const img = e.target.closest('.editor-content-area img');
      if (img) {
        e.stopPropagation();
        selectEditorImage(img);
      } else if (!e.target.closest('#editorImgBubble')) {
        deselectEditorImage();
      }
    });

    if (DOM.bubbleCropBtn) {
      DOM.bubbleCropBtn.addEventListener('click', () => {
        if (currentSelectedImg) {
          const editor = currentSelectedImg.closest('.editor-content-area');
          openCropper(currentSelectedImg.src, editor, currentSelectedImg);
          deselectEditorImage();
        }
      });
    }

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

    if (left < 10) left = 10;
    if (left + bubbleW > window.innerWidth - 10) left = window.innerWidth - bubbleW - 10;
    if (top < 10) top = rect.bottom + 8;

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  }

  /* ==========================================================================
     Fullscreen Zoom Lightbox (Inspection without +/- buttons)
     ========================================================================== */

  function bindLightboxEvents() {
    document.addEventListener('click', (e) => {
      const cardImg = e.target.closest('.explanation-body img, .note-card-content img, .content-zoomable-img');
      if (cardImg && !cardImg.closest('.editor-content-area')) {
        e.preventDefault();
        openLightbox(cardImg.src, cardImg.alt || 'Study Diagram');
      }
    });

    if (DOM.closeLightboxBtn) DOM.closeLightboxBtn.addEventListener('click', closeLightbox);

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

    if (DOM.lightboxStage) {
      DOM.lightboxStage.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setLightboxZoom(state.lightboxZoom + delta);
      }, { passive: false });

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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.lightboxOpen) closeLightbox();
        else if (state.isOpen) closeCropper();
        else if (DOM.screenClipModal && DOM.screenClipModal.classList.contains('open')) closeScreenClipModal();
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
    closeLightbox,
    startScreenClipping,
    openScreenClipModal,
    closeScreenClipModal
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ImageCropper.init);
} else {
  ImageCropper.init();
}
