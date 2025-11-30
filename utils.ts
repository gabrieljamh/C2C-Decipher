import { GameData } from './types';

export const calculatePassword = (data: GameData): string => {
  const { serialNumber, deviceModel, deviceName, deviceIp, fabDay, fabMonth, latency } = data;

  // Prerequisites check
  if (!serialNumber || !deviceModel || !deviceName || !deviceIp || !fabDay || !fabMonth || !latency) {
    return 'PENDING...';
  }

  try {
    // --- Section 1 (AA) ---
    // Check first numerical character in Serial Number
    const firstDigitMatch = serialNumber.match(/\d/);
    let aa = '00';
    
    if (firstDigitMatch) {
      const firstDigit = parseInt(firstDigitMatch[0], 10);
      const cleanModel = deviceModel.replace('-', ''); // Treat model without dash for easier indexing if needed, but prompt implies specific positions relative to XXX-XXX
      // Prompt says: "OOX-XXX" (first two) or "XXX-XOO" (last two)
      // Assuming standard XXX-XXX format implies 7 chars.
      
      if (firstDigit % 2 === 0) {
        // Even: First two characters of Device Model
        aa = deviceModel.replace(/-/g, '').substring(0, 2);
      } else {
        // Odd: Last two characters of Device Model
        const modelNoDash = deviceModel.replace(/-/g, '');
        aa = modelNoDash.substring(modelNoDash.length - 2);
      }
    } else {
        // Fallback if no digit found (though rules imply there is one)
        aa = '??';
    }

    // --- Section 2 (BB) ---
    // Latency < 50 ? Day : Month
    const latNum = parseInt(latency, 10);
    let bb = '00';
    if (!isNaN(latNum)) {
      bb = latNum < 50 ? fabDay : fabMonth;
    }

    // --- Section 3 (CC) ---
    // Sum of all digits in Device IP
    const ipDigits = deviceIp.replace(/\D/g, '').split('');
    const sumIp = ipDigits.reduce((acc, curr) => acc + parseInt(curr, 10), 0);
    let cc = sumIp.toString().padStart(2, '0'); // Pad to ensure 8 char password consistency

    // --- Section 4 (DD) ---
    // Vowels vs Consonants sum in Device Name
    const vowels = deviceName.match(/[aeiou]/gi)?.length || 0;
    const consonants = (deviceName.match(/[bcdfghjklmnpqrstvwxyz]/gi)?.length || 0);
    
    let dd = '';
    if (vowels > consonants) {
        dd = `${vowels}${consonants}`;
    } else {
        dd = `${consonants}${vowels}`;
    }

    // Final Assembly
    // Ensure all parts are uppercase
    return `${aa}${bb}${cc}${dd}`.toUpperCase();
  } catch (e) {
    return 'ERROR';
  }
};
