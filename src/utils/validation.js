export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6 && /\d/.test(password);
};

export const validateEventData = (eventData) => {
  const errors = {};

  if (!eventData.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!eventData.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!eventData.date) {
    errors.date = 'Date is required';
  } else if (new Date(eventData.date) < new Date()) {
    errors.date = 'Event date must be in the future';
  }

  if (!eventData.location?.address) {
    errors.location = 'Location is required';
  }

  if (!eventData.category) {
    errors.category = 'Category is required';
  }

  if (!eventData.ticketTiers?.length) {
    errors.ticketTiers = 'At least one ticket tier is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 