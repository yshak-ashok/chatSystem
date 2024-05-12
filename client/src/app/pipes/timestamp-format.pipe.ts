import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestampFormat',
  standalone: true
})
export class TimestampFormatPipe implements PipeTransform {
  transform(timestamp: string): string {
    // Check if timestamp is valid
    if (!timestamp || typeof timestamp !== 'string') {
      return ''; // Return empty string for invalid timestamps
    }
  
    // Parse the timestamp
    const date = new Date(timestamp);
  
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''; // Return empty string for invalid dates
    }
  
    // Extract date components
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    // const day = String(date.getDate()).padStart(2, '0');
  
    // Extract time components
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // Convert hours to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 for 12-hour format
  
    // Construct formatted timestamp string
     //return `${year}-${month}-${day} - ${hours}:${minutes} ${ampm}`;
    return `${hours}:${minutes} ${ampm}`;
  }

}
