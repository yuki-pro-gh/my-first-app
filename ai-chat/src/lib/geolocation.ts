export async function reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
  );
  const data = await res.json();
  const city = data.address?.city ?? data.address?.town ?? data.address?.county ?? "";
  const country = data.address?.country ?? "";
  const result = [city, country].filter(Boolean).join(", ");
  return result || undefined;
}
