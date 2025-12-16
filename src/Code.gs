/**
 * Booking Management Script
 * Deplyoyed in Google Sheets script editor
 * Direct menu buttons for sorting and export view
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🟡 Custom Actions')
    .addItem('Sort Reservations', 'sortBookingData')
    .addItem('Refresh view orders', 'viewPrint')
    .addItem('Add manual booking', 'addManualBooking')
    .addToUi();
}

/**
 * Adds a new row at the end of reservations sheet
 * Prefills: Booking ID (UUID), Reservation Created At (now), Booking Type (office-manual)
 */
function addManualBooking() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('reservations');

    if (!sheet) {
      SpreadsheetApp.getUi().alert('Sheet "reservations" not found.');
      return;
    }

    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      SpreadsheetApp.getUi().alert('No headers found in reservations.');
      return;
    }

    // Get headers and build column index
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const colIdx = {};
    for (let i = 0; i < headers.length; i++) {
      colIdx[String(headers[i]).trim()] = i;
    }

    // Validate required columns exist
    const requiredCols = ['Booking ID', 'Reservation Created At', 'Booking Type'];
    for (const col of requiredCols) {
      if (colIdx[col] === undefined) {
        SpreadsheetApp.getUi().alert('Missing column: ' + col);
        return;
      }
    }

    // Generate UUID
    const uuid = Utilities.getUuid();

    // Current timestamp in ISO format
    const now = new Date();
    const isoTimestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    // Create new row with empty values
    const newRow = Array(lastCol).fill('');

    // Prefill values
    newRow[colIdx['Booking ID']] = uuid;
    newRow[colIdx['Reservation Created At']] = isoTimestamp;
    newRow[colIdx['Booking Type']] = 'office-manual';

    // Append row
    sheet.appendRow(newRow);

    // Move to the new row
    const newRowNum = sheet.getLastRow();
    sheet.setActiveRange(sheet.getRange(newRowNum, 1));

    SpreadsheetApp.getUi().alert('New booking added!\nID: ' + uuid);

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

function sortBookingData() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow <= 1 || lastCol === 0) {
      SpreadsheetApp.getUi().alert('No data found to sort.');
      return;
    }

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const courseStartIdx = findColumnIndexZeroBased(headers, 'Course Start');
    const lessonTypeIdx = findColumnIndexZeroBased(headers, 'Lesson Type');
    const bookingTypeIdx = findColumnIndexZeroBased(headers, 'Booking Type');
    const confirmedIdx = findColumnIndexZeroBased(headers, 'CONFIRMED');
    const reservationCreatedIdx = findColumnIndexZeroBased(headers, 'Reservation Created At');

    if (courseStartIdx === -1 || lessonTypeIdx === -1) {
      SpreadsheetApp.getUi().alert('Required columns not found: Course Start and Lesson Type');
      return;
    }

    if (reservationCreatedIdx === -1) {
      SpreadsheetApp.getUi().alert('Required column not found: Reservation Created At');
      return;
    }

    // Get data (excluding header)
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const data = dataRange.getValues();

    // Custom sort:
    // Priority 1 (top): Unconfirmed rows (CONFIRMED is empty/blank AND Booking Type does NOT contain "-replaced")
    //                   - sorted by Reservation Created At descending (newest first)
    // Priority 2 (bottom): All other rows (confirmed OR replaced)
    //                      - sorted by Course Start desc, Lesson Type asc
    data.sort(function(a, b) {
      const aIsUnconfirmed = isUnconfirmed(a, bookingTypeIdx, confirmedIdx);
      const bIsUnconfirmed = isUnconfirmed(b, bookingTypeIdx, confirmedIdx);

      // Unconfirmed rows go to TOP
      if (aIsUnconfirmed && !bIsUnconfirmed) return -1;
      if (!aIsUnconfirmed && bIsUnconfirmed) return 1;

      // Both unconfirmed: sort by Reservation Created At descending (newest first)
      if (aIsUnconfirmed && bIsUnconfirmed) {
        const dateA = new Date(a[reservationCreatedIdx]);
        const dateB = new Date(b[reservationCreatedIdx]);
        return dateB - dateA; // descending (newest first)
      }

      // Both confirmed/other: sort by Course Start descending
      const dateA = new Date(a[courseStartIdx]);
      const dateB = new Date(b[courseStartIdx]);
      if (dateB - dateA !== 0) return dateB - dateA;

      // Then by Lesson Type ascending
      const lessonA = String(a[lessonTypeIdx] || '').toLowerCase();
      const lessonB = String(b[lessonTypeIdx] || '').toLowerCase();
      return lessonA.localeCompare(lessonB);
    });

    // Write sorted data back
    dataRange.setValues(data);

    SpreadsheetApp.getUi().alert('Data sorted successfully!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/**
 * Check if row is unconfirmed (should be sorted to TOP)
 * - CONFIRMED is empty (blank field means unconfirmed)
 * - AND Booking Type does NOT contain "-replaced"
 */
function isUnconfirmed(row, bookingTypeIdx, confirmedIdx) {
  // First check if CONFIRMED is empty
  if (confirmedIdx !== -1) {
    const confirmed = String(row[confirmedIdx] || '').trim();
    if (confirmed !== '') return false; // Not empty = confirmed, goes to bottom
  } else {
    return false; // No CONFIRMED column = treat as confirmed
  }
  
  // Then check Booking Type - if contains "-replaced", goes to bottom
  if (bookingTypeIdx !== -1) {
    const bookingType = String(row[bookingTypeIdx] || '').toLowerCase().trim();
    if (bookingType.indexOf('-replaced') !== -1) return false; // replaced goes to bottom
  }
  
  return true; // Empty CONFIRMED and NOT replaced = unconfirmed, goes to TOP
}

/**
 * Find column index (0-based) by header name
 */
function findColumnIndexZeroBased(headers, columnName) {
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase().trim() === columnName.toLowerCase().trim()) {
      return i;
    }
  }
  return -1;
}

/**
 * Exports from "reservations" to "view orders" sheet
 * Filters: CONFIRMED contains "yes" AND today or future dates
 * Preserves: Row backgrounds, text colors, alignment, wraps, column widths
 *
 * Columns exported (in order):
 * Course Start, Customer Name, Number of Persons, Activity, Lesson Type,
 * Age Group, Number of Days, Total % Discount, Total Price, Customer Note, 
 * Management Note, Booking ID
 *
 * Total % Discount = Sum of: OnLine Discount, Seasonal Discount, 
 * Special Discount, Voucher Discount
 *
 * Excluded columns (commented out): Day, Course Time Start, Payment
 */
function viewPrint() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = ss.getSheetByName('reservations');

    if (!sourceSheet) {
      SpreadsheetApp.getUi().alert('Sheet "reservations" not found.');
      return;
    }

    let destSheet = ss.getSheetByName('view orders');
    const isNewSheet = !destSheet;
    if (isNewSheet) {
      destSheet = ss.insertSheet('view orders');
    }

    // Output columns - updated order, excluded: Day, Course Time Start, Payment
    const outputHeaders = [
      'Course Start',
      'Customer Name',
      'Number of Persons',
      'Activity',
      'Lesson Type',
      'Age Group',
      'Number of Days',
      'Total % Discount',
      'Total Price',
      'Customer Note',
      'Management Note',
      'Booking ID'
      // Excluded columns:
      // 'Day',
      // 'Course Time Start',
      // 'Payment'
    ];

    const lastRow = sourceSheet.getLastRow();
    const lastCol = sourceSheet.getLastColumn();

    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert('No data in reservations.');
      return;
    }

    // Build source column index
    const headers = sourceSheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const colIdx = {};
    for (let i = 0; i < headers.length; i++) {
      colIdx[String(headers[i]).trim()] = i;
    }

    // Validate required columns (Management Note is optional)
    const required = ['Booking ID', 'Course Start', 'Customer Name', 'Number of Persons',
                      'Number of Days', 'Activity', 'Age Group', 'Lesson Type', 'CONFIRMED',
                      'Customer Note', 'Total Price'];
    for (const col of required) {
      if (colIdx[col] === undefined) {
        SpreadsheetApp.getUi().alert('Missing column: ' + col);
        return;
      }
    }
    
    // Optional discount columns (for Total % Discount calculation)
    const discountCols = ['OnLine Discount', 'Seasonal Discount', 'Special Discount', 'Voucher Discount'];
    
    // Build case-insensitive column lookup for discounts
    const discountColIndices = {};
    for (const discountCol of discountCols) {
      const normalizedName = discountCol.toLowerCase().trim();
      for (let i = 0; i < headers.length; i++) {
        const headerName = String(headers[i]).toLowerCase().trim();
        if (headerName === normalizedName) {
          discountColIndices[discountCol] = i;
          break;
        }
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Excluded

    // Load existing formatting from destination
    const rowFormats = {}; // backgrounds, colors, alignment, wraps
    let savedWidths = [];
    let headerFormat = null;

    if (!isNewSheet) {
      const destLastRow = destSheet.getLastRow();
      const destLastCol = destSheet.getLastColumn();

      // Save column widths
      if (destLastCol > 0) {
        for (let i = 1; i <= Math.max(destLastCol, outputHeaders.length); i++) {
          savedWidths.push(destSheet.getColumnWidth(i));
        }
      }

      // Save header formatting
      if (destLastCol > 0) {
        const headerRange = destSheet.getRange(1, 1, 1, destLastCol);
        headerFormat = {
          bg: headerRange.getBackgrounds()[0],
          colors: headerRange.getFontColors()[0],
          weights: headerRange.getFontWeights()[0],
          align: headerRange.getHorizontalAlignments()[0],
          wrap: headerRange.getWraps()[0]
        };
      }

      if (destLastRow > 1 && destLastCol > 0) {
        const destHeaders = destSheet.getRange(1, 1, 1, destLastCol).getValues()[0];
        const destColIdx = {};
        for (let i = 0; i < destHeaders.length; i++) {
          destColIdx[String(destHeaders[i]).trim()] = i;
        }

        if (destColIdx['Booking ID'] !== undefined) {
          const dataRange = destSheet.getRange(2, 1, destLastRow - 1, destLastCol);
          const existingBg = dataRange.getBackgrounds();
          const existingColors = dataRange.getFontColors();
          const existingAlign = dataRange.getHorizontalAlignments();
          const existingWrap = dataRange.getWraps();
          const existingData = dataRange.getValues();

          for (let i = 0; i < existingData.length; i++) {
            const row = existingData[i];
            const bid = String(row[destColIdx['Booking ID']] || '').trim();
            if (bid) {
              rowFormats[bid] = {
                bg: existingBg[i],
                color: existingColors[i],
                align: existingAlign[i],
                wrap: existingWrap[i]
              };
            }
          }
        }
      }
    }

    // Process source data
    const sourceData = sourceSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    const outputData = [];
    const outputDates = []; // For sorting
    const outputBg = [];
    const outputColors = [];
    const outputAlign = [];
    const outputWrap = [];

    for (const row of sourceData) {
      const bookingId = String(row[colIdx['Booking ID']] || '').trim();
      if (!bookingId) continue;

      // Filter: CONFIRMED must contain "yes"
      const confirmed = String(row[colIdx['CONFIRMED']] || '').toLowerCase();
      if (confirmed.indexOf('yes') === -1) continue;

      // Filter: Today or future
      const courseStartDate = new Date(row[colIdx['Course Start']]);
      if (isNaN(courseStartDate.getTime())) continue;
      courseStartDate.setHours(0, 0, 0, 0);
      if (courseStartDate < today) continue;

      const fmt = rowFormats[bookingId];

      outputDates.push(courseStartDate.getTime()); // For sorting

      // Calculate Total % Discount from discount columns
      let totalDiscount = 0;
      for (const discountCol of discountCols) {
        if (discountColIndices[discountCol] !== undefined) {
          const discountValue = parseFloat(row[discountColIndices[discountCol]]) || 0;
          totalDiscount += discountValue;
        }
      }

      // Build output row - new column order with Total % Discount and Total Price
      outputData.push([
        formatDateDM(courseStartDate),            // Course Start
        row[colIdx['Customer Name']] || '',       // Customer Name
        row[colIdx['Number of Persons']] || '',   // Number of Persons
        row[colIdx['Activity']] || '',            // Activity
        row[colIdx['Lesson Type']] || '',         // Lesson Type
        row[colIdx['Age Group']] || '',           // Age Group
        row[colIdx['Number of Days']] || '',      // Number of Days
        totalDiscount,                            // Total % Discount (calculated)
        row[colIdx['Total Price']] || '',         // Total Price
        row[colIdx['Customer Note']] || '',       // Customer Note
        colIdx['MANAGEMENT NOTE'] !== undefined ? (row[colIdx['MANAGEMENT NOTE']] || '') : '',  // MANAGEMENT NOTE (optional)
        bookingId                                 // Booking ID
        // Excluded columns:
        // dayNames[courseStartDate.getDay()],    // Day
        // '',                                    // Course Time Start (manual)
        // ''                                     // Payment (manual)
      ]);

      // Build formatting arrays
      if (fmt) {
        outputBg.push(expandArray(fmt.bg, outputHeaders.length, '#ffffff'));
        outputColors.push(expandArray(fmt.color, outputHeaders.length, '#000000'));
        outputAlign.push(expandArray(fmt.align, outputHeaders.length, 'left'));
        outputWrap.push(expandArray(fmt.wrap, outputHeaders.length, false));
      } else {
        outputBg.push(Array(outputHeaders.length).fill('#ffffff'));
        outputColors.push(Array(outputHeaders.length).fill('#000000'));
        outputAlign.push(Array(outputHeaders.length).fill('left'));
        outputWrap.push(Array(outputHeaders.length).fill(false));
      }
    }

    // Sort by Course Start (using stored timestamps)
    const indices = outputData.map((_, i) => i);
    indices.sort((a, b) => outputDates[a] - outputDates[b]);
    const sortedData = indices.map(i => outputData[i]);
    const sortedBg = indices.map(i => outputBg[i]);
    const sortedColors = indices.map(i => outputColors[i]);
    const sortedAlign = indices.map(i => outputAlign[i]);
    const sortedWrap = indices.map(i => outputWrap[i]);

    // Write to destination
    destSheet.clear();
    const headerOutRange = destSheet.getRange(1, 1, 1, outputHeaders.length);
    headerOutRange.setValues([outputHeaders]);

    // Restore header formatting
    if (headerFormat) {
      headerOutRange.setBackgrounds([expandArray(headerFormat.bg, outputHeaders.length, '#f3f3f3')]);
      headerOutRange.setFontColors([expandArray(headerFormat.colors, outputHeaders.length, '#000000')]);
      headerOutRange.setFontWeights([expandArray(headerFormat.weights, outputHeaders.length, 'bold')]);
      headerOutRange.setHorizontalAlignments([expandArray(headerFormat.align, outputHeaders.length, 'left')]);
      headerOutRange.setWraps([expandArray(headerFormat.wrap, outputHeaders.length, false)]);
    } else {
      headerOutRange.setFontWeight('bold');
      headerOutRange.setBackground('#f3f3f3');
    }

    if (sortedData.length > 0) {
      const dataRange = destSheet.getRange(2, 1, sortedData.length, outputHeaders.length);
      dataRange.setValues(sortedData);
      dataRange.setBackgrounds(sortedBg);
      dataRange.setFontColors(sortedColors);
      dataRange.setHorizontalAlignments(sortedAlign);
      dataRange.setWraps(sortedWrap);
    }

    // Restore column widths
    if (savedWidths.length > 0) {
      for (let i = 0; i < savedWidths.length && i < outputHeaders.length; i++) {
        destSheet.setColumnWidth(i + 1, savedWidths[i]);
      }
    }

    SpreadsheetApp.flush();
    SpreadsheetApp.getUi().alert('Done! ' + sortedData.length + ' rows.');

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

function expandArray(arr, length, defaultVal) {
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(arr && i < arr.length ? arr[i] : defaultVal);
  }
  return result;
}

function formatDateDM(date) {
  const day = String(date.getDate());
  const month = String(date.getMonth() + 1);
  return day + '.' + month + '.';
}

function findColumnIndex(headers, columnName) {
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase().trim() === columnName.toLowerCase().trim()) {
      return i + 1;
    }
  }
  return -1;
}