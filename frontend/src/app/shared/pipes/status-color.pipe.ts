import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'statusColor' })
export class StatusColorPipe implements PipeTransform {
    transform(status?: 'Active' | 'Complete' | 'Pending' | string | undefined): string {
        switch (status) {
            case 'Active':
                return 'inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800';
            case 'Complete':
                return 'inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800';
            case 'Pending':
                return 'inline-block px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800';
            default:
                return 'inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800';
        }
    }
}
