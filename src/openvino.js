const OpenVINOAI = {
  // Function to filter relevant volunteers based on disaster description, type, and other attributes
  filterVolunteer: (volunteerData, description, disasterType, currentLocation) => {
    let matches = false;

    // Filter by disaster type (e.g., Earthquake, Flood)
    if (disasterType && volunteerData.expertise.includes(disasterType)) {
      matches = true;
    }

    // Additional matching based on volunteer skills, description
    if (!matches && (description.includes(volunteerData.skill) || description.includes(volunteerData.description))) {
      matches = true;
    }

    // Filter by location proximity (assuming volunteerData.location is in lat, lng format)
    if (!matches && volunteerData.location) {
      const distance = OpenVINOAI.calculateDistance(volunteerData.location, currentLocation); // Use OpenVINOAI to access calculateDistance
      if (distance <= 10) { // 10 km radius, adjust as needed
        matches = true;
      }
    }

    // Return true if volunteer matches any of the filters
    return matches;
  },

  // Calculate distance between two geo-coordinates (using Haversine formula for simplicity)
  calculateDistance: (loc1, loc2) => {
    const R = 6371; // Earth radius in kilometers
    const dLat = OpenVINOAI.toRadians(loc2.lat - loc1.lat); // Access toRadians via OpenVINOAI
    const dLon = OpenVINOAI.toRadians(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(OpenVINOAI.toRadians(loc1.lat)) * Math.cos(OpenVINOAI.toRadians(loc2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  },

  // Convert degrees to radians
  toRadians: (degrees) => {
    return degrees * (Math.PI / 180);
  },

  // Function to get nearby volunteers when no relevant volunteers are found
  getNearbyVolunteers: (volunteers, currentLocation) => {
    const nearbyVolunteers = volunteers.filter(volunteer => {
      const distance = OpenVINOAI.calculateDistance(volunteer.location, currentLocation); // Use OpenVINOAI to access calculateDistance
      return distance <= 10; // 10 km radius
    });
    return nearbyVolunteers;
  }
};

export default OpenVINOAI;
