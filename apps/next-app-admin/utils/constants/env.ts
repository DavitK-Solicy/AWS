export interface EnvVariables {
  nextPublicApiBaseUrl: string;
}

const env: EnvVariables = {
  nextPublicApiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8080',
};

export default env;
