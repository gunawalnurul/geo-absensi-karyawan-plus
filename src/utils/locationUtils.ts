export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

const checkPermissionStatus = async (): Promise<string> => {
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      console.log('🔐 Permission status:', permission.state);
      return permission.state;
    } catch (error) {
      console.log('🔐 Permission API not available:', error);
      return 'unknown';
    }
  }
  return 'unknown';
};

const getBrowserName = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Browser';
};

const getLocationWithOptions = (options: PositionOptions): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    console.log('📍 Attempting geolocation with options:', options);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('✅ Location obtained successfully:', coords);
        resolve(coords);
      },
      (error) => {
        console.error('❌ Geolocation attempt failed:', error);
        reject(error);
      },
      options
    );
  });
};

export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise(async (resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation tidak didukung di browser ini. Silakan gunakan Work From Home jika disetujui.'));
      return;
    }

    // Check permission status first
    const permissionStatus = await checkPermissionStatus();
    console.log('🔐 Initial permission status:', permissionStatus);

    if (permissionStatus === 'denied') {
      const browserName = getBrowserName();
      reject(new Error(`Akses lokasi ditolak. Untuk mengaktifkan di ${browserName}: Klik ikon 🔒/📍 di address bar → Pilih "Allow". Atau refresh halaman dan klik "Allow" saat diminta, atau ajukan Work From Home.`));
      return;
    }

    // Progressive geolocation strategy - try high accuracy first, then fallback
    const strategies = [
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 300000
      }
    ];

    let lastError: GeolocationPositionError | null = null;

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🎯 Strategy ${i + 1}/${strategies.length}:`, strategies[i]);
        const coords = await getLocationWithOptions(strategies[i]);
        resolve(coords);
        return;
      } catch (error) {
        lastError = error as GeolocationPositionError;
        console.log(`❌ Strategy ${i + 1} failed:`, error);
        
        // If permission denied, don't try other strategies
        if (lastError.code === lastError.PERMISSION_DENIED) {
          break;
        }
        
        // Add delay between attempts
        if (i < strategies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // All strategies failed, generate appropriate error message
    let errorMessage = '';
    const browserName = getBrowserName();
    
    if (lastError) {
      switch(lastError.code) {
        case lastError.PERMISSION_DENIED:
          errorMessage = `Akses lokasi ditolak. Untuk mengaktifkan di ${browserName}: Klik ikon 🔒/📍 di address bar → Pilih "Allow". Atau refresh halaman dan klik "Allow" saat diminta, atau ajukan Work From Home.`;
          break;
        case lastError.POSITION_UNAVAILABLE:
          errorMessage = 'Lokasi tidak tersedia. Pastikan GPS aktif, koneksi internet stabil, dan izin lokasi diaktifkan. Atau ajukan Work From Home jika disetujui.';
          break;
        case lastError.TIMEOUT:
          errorMessage = 'Waktu habis saat mengambil lokasi. Coba lagi dengan koneksi internet yang lebih stabil atau ajukan Work From Home.';
          break;
        default:
          errorMessage = 'Gagal mengambil lokasi setelah beberapa percobaan. Periksa pengaturan browser dan koneksi internet, atau ajukan Work From Home.';
          break;
      }
    } else {
      errorMessage = 'Gagal mengambil lokasi. Periksa pengaturan browser dan koneksi internet, atau ajukan Work From Home.';
    }
    
    reject(new Error(errorMessage));
  });
};