const OpenVINOAI = {
    filterVolunteer: (volunteerData, description) => {
      // Example: Basic matching logic; replace with real OpenVINO model logic
      if (description.includes(volunteerData.skill)) {
        return true; // Volunteer matches the disaster type or description
      }
      return false;
    },
  };
  
  export default OpenVINOAI;
  