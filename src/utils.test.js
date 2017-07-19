import { getters, base64Encode, base64Decode, token, toss } from './utils';

it('should create getters', () => {
  const data = {
    agent: 820,
    operation: 'Dark Night',
  };

  const acc = getters({
    id: 'agent',
    op: 'operation',
    realFunc: () => 420,
  });

  expect(acc.id(data)).toBe(data['agent']);
  expect(acc.op(data)).toBe(data['operation']);
  expect(acc.realFunc(data)).toBe(420);
});

it('should base64 encode', () => {
  const input = 'sam.babic@onbase.com:password';
  const encoded = base64Encode(input);

  expect(encoded).toEqual('c2FtLmJhYmljQG9uYmFzZS5jb206cGFzc3dvcmQ=');
});

it('should decode base64', () => {
  const input = 'c2FtLmJhYmljQG9uYmFzZS5jb206cGFzc3dvcmQ=';
  const decoded = base64Decode(input);

  expect(decoded).toEqual('sam.babic@onbase.com:password');
});

it('should generate random tokens', async () => {
  const one = await token();
  const two = await token();

  expect(one).not.toEqual(two);
});

it('should toss errors gently', () => {
  const err = new TypeError('this is the error which will be thrown');
  expect(() => toss(err)).toThrowError(err);
});
