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

export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('📍 Location obtained successfully:', coords);
          resolve(coords);
        },
        (error) => {
          console.error('🌍 Geolocation error:', error);
          let errorMessage = '';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Akses lokasi ditolak oleh browser. Untuk mengaktifkan lokasi: klik ikon kunci/lokasi di address bar browser, pilih "Allow/Izinkan". Atau ajukan Work From Home untuk absensi tanpa lokasi.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Lokasi tidak tersedia. Pastikan GPS aktif, koneksi internet stabil, dan izin lokasi diaktifkan. Atau ajukan Work From Home jika disetujui.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Waktu habis saat mengambil lokasi. Coba lagi dengan koneksi internet yang lebih stabil atau ajukan Work From Home.';
              break;
            default:
              errorMessage = 'Gagal mengambil lokasi. Periksa pengaturan browser dan koneksi internet, atau ajukan Work From Home.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      reject(new Error('Geolocation tidak didukung di browser ini. Silakan gunakan Work From Home jika disetujui.'));
    }
  });
};