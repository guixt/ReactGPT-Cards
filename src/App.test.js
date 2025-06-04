import { createPlaceholderImage } from './chatgptfunctions';

test('createPlaceholderImage returns a string', () => {
  const result = createPlaceholderImage();
  expect(typeof result).toBe('string');
});
