import { readSciGatewayToken } from './parseTokens';

describe('readSciGatewayToken', () => {
  const localStorageGetItemMock = jest.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );

  it('should read token from localstorage', () => {
    localStorageGetItemMock.mockImplementationOnce(
      () =>
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJhdXRob3Jpc2VkX3JvdXRlcyI6bnVsbCwiZXhwIjoxNjQwOTk1MjAwfQ.Qar3mbQ_a4Ih6InEgT-Yk-86-77uoRltjv5m0M7Yp-4OhatXJ93nHJ-CNDGVCcXV2gfsiNfuXc7GOJs3vQ31XqWELU04L27E9T4ZrihIS7WUNlIGo18vFbL3IOnOqkDgvnPvHqFxa-Bk3Acppgn8yq9_fqoDWNLaGNhKKZovwobkxoNJF6wgj12OjJz4_-hHlHeMfEamosIivh0SHkGs_gAJdXBltfX4uqUStXKZmkW8TfPTU07iMzp9csCUbp3IDLMEcEN9H7V1QSnTFSjoeenXnXitrUY1ygmy1nreKGGfhhFkCBFWe6h65bEsbtVMWIJjq0JnefCQ8rsamJHXsw'
    );
    const result = readSciGatewayToken();
    expect(result).toEqual(
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJhdXRob3Jpc2VkX3JvdXRlcyI6bnVsbCwiZXhwIjoxNjQwOTk1MjAwfQ.Qar3mbQ_a4Ih6InEgT-Yk-86-77uoRltjv5m0M7Yp-4OhatXJ93nHJ-CNDGVCcXV2gfsiNfuXc7GOJs3vQ31XqWELU04L27E9T4ZrihIS7WUNlIGo18vFbL3IOnOqkDgvnPvHqFxa-Bk3Acppgn8yq9_fqoDWNLaGNhKKZovwobkxoNJF6wgj12OjJz4_-hHlHeMfEamosIivh0SHkGs_gAJdXBltfX4uqUStXKZmkW8TfPTU07iMzp9csCUbp3IDLMEcEN9H7V1QSnTFSjoeenXnXitrUY1ygmy1nreKGGfhhFkCBFWe6h65bEsbtVMWIJjq0JnefCQ8rsamJHXsw'
    );
  });

  it("should return null if token doesn't contain username field", () => {
    localStorageGetItemMock.mockImplementationOnce(
      () =>
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdXRob3Jpc2VkX3JvdXRlcyI6bnVsbCwiZXhwIjoxNjQwOTk1MjAwfQ.Qar3mbQ_a4Ih6InEgT-Yk-86-77uoRltjv5m0M7Yp-4OhatXJ93nHJ-CNDGVCcXV2gfsiNfuXc7GOJs3vQ31XqWELU04L27E9T4ZrihIS7WUNlIGo18vFbL3IOnOqkDgvnPvHqFxa-Bk3Acppgn8yq9_fqoDWNLaGNhKKZovwobkxoNJF6wgj12OjJz4_-hHlHeMfEamosIivh0SHkGs_gAJdXBltfX4uqUStXKZmkW8TfPTU07iMzp9csCUbp3IDLMEcEN9H7V1QSnTFSjoeenXnXitrUY1ygmy1nreKGGfhhFkCBFWe6h65bEsbtVMWIJjq0JnefCQ8rsamJHXsw'
    );
    const result = readSciGatewayToken();
    expect(result).toEqual(null);
  });

  it("should return null if token doesn't exist", () => {
    localStorageGetItemMock.mockImplementationOnce(() => null);
    const result = readSciGatewayToken();
    expect(result).toEqual(null);
  });
});
