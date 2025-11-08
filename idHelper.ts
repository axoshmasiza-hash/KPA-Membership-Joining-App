/**
 * Validates a South African ID number using the Luhn algorithm.
 * @param idNumber The 13-digit ID number string.
 * @returns True if the checksum is valid, false otherwise.
 */
const isValidChecksum = (idNumber: string): boolean => {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(idNumber.charAt(i));
    if (i % 2 === 0) {
      sum += digit;
    } else {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }
  return sum % 10 === 0;
};

/**
 * Parses a South African ID number to extract the date of birth.
 * @param idNumber The 13-digit ID number string.
 * @returns A formatted date string 'YYYY-MM-DD' if valid, otherwise null.
 */
export const validateAndParseSAID = (idNumber: string): { dateOfBirth: string; error: string | null } => {
  if (!/^\d{13}$/.test(idNumber)) {
    return { dateOfBirth: '', error: 'ID number must be 13 digits.' };
  }

  if (!isValidChecksum(idNumber)) {
    return { dateOfBirth: '', error: 'Invalid ID number checksum.' };
  }

  let year = parseInt(idNumber.substring(0, 2), 10);
  const month = idNumber.substring(2, 4);
  const day = idNumber.substring(4, 6);

  // Determine century
  const currentYearLastTwoDigits = new Date().getFullYear() % 100;
  year = year <= currentYearLastTwoDigits ? 2000 + year : 1900 + year;

  // Basic date validation
  const date = new Date(`${year}-${month}-${day}`);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== parseInt(month, 10) ||
    date.getDate() !== parseInt(day, 10)
  ) {
    return { dateOfBirth: '', error: 'Invalid date of birth in ID number.' };
  }

  return { dateOfBirth: `${year}-${month}-${day}`, error: null };
};
