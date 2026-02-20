import { supabase } from '../services/supabase';
import { googleMapsService } from '../services/googleMaps.service';

/**
 * Utility to fix existing campgrounds that are missing coordinates
 * Run this in browser console:
 * import('/src/utils/fixCampgroundCoords.js').then(m => m.fixCampgroundCoordinates())
 */
export async function fixCampgroundCoordinates() {
  console.log('🔧 Starting campground coordinates fix...');

  // Get all campgrounds missing coordinates
  const { data: campgrounds, error } = await supabase
    .from('campgrounds')
    .select('*')
    .or('latitude.is.null,longitude.is.null');

  if (error) {
    console.error('Error fetching campgrounds:', error);
    return;
  }

  if (!campgrounds || campgrounds.length === 0) {
    console.log('✅ All campgrounds already have coordinates!');
    return;
  }

  console.log(`Found ${campgrounds.length} campgrounds missing coordinates`);

  for (const campground of campgrounds) {
    try {
      console.log(`Fetching details for: ${campground.name}`);

      // Fetch details from Google Places API
      const details = await googleMapsService.getCampgroundDetails(campground.google_place_id);

      const lat = (details as any).geometry?.location?.lat?.();
      const lng = (details as any).geometry?.location?.lng?.();

      if (lat && lng) {
        // Update the campground with coordinates
        const { error: updateError } = await supabase
          .from('campgrounds')
          .update({
            latitude: lat,
            longitude: lng,
          })
          .eq('id', campground.id);

        if (updateError) {
          console.error(`❌ Error updating ${campground.name}:`, updateError);
        } else {
          console.log(`✅ Updated ${campground.name} with coords: ${lat}, ${lng}`);
        }
      } else {
        console.warn(`⚠️  No coordinates found for ${campground.name}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`❌ Error processing ${campground.name}:`, err);
    }
  }

  console.log('🎉 Campground coordinates fix complete!');
}
