import { toggleSingleRecordOption } from '@/features/prototype/record-selection';

describe('record detail single-select options', () => {
  it('clears a selected option when tapped again', () => {
    expect(toggleSingleRecordOption('多量', '多量')).toBe('');
  });

  it('replaces a selected option when another option is chosen', () => {
    expect(toggleSingleRecordOption('多量', '中量')).toBe('中量');
  });
});
