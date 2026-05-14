export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function checkWebGLCapabilities() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return {
        supported: false,
        maxTextureSize: 0,
        renderer: 'unknown',
        vendor: 'unknown'
      };
    }

    const webgl = gl as WebGLRenderingContext;
    
    return {
      supported: true,
      maxTextureSize: webgl.getParameter(webgl.MAX_TEXTURE_SIZE),
      renderer: 'unknown',
      vendor: 'unknown'
    };
  } catch {
    return {
      supported: false,
      maxTextureSize: 0,
      renderer: 'unknown',
      vendor: 'unknown'
    };
  }
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function shouldUseSimplified3D(): boolean {
  const isMobile = isMobileDevice();
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  const webgl = checkWebGLCapabilities();
  
  return !webgl.supported || Boolean(isMobile && isLowEnd);
}
