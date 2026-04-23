import.meta.env.BASE_URL = '/'

// vitest with jsdom does not auto-advance requestAnimationFrame in real-timer mode.
// Replace with an immediate setTimeout so component polling resolves in tests.
global.requestAnimationFrame = (cb) => setTimeout(cb, 0) as unknown as number
