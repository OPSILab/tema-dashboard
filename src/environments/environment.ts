/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === '') {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

export const environment = {
  production: false,
  dashboardBaseURL: process.env.APP_DASHBOARD_BASE_URL || '',
  idmBaseURL: process.env.APP_IDM_BASE_URL || '',
  idmRealmName: process.env.APP_IDM_REALM_NAME || '',
  authProfile: process.env.APP_AUTH_PROFILE || '',
  client_id: process.env.APP_CLIENT_ID || '',
  client_secret: process.env.APP_CLIENT_SECRET || '',
  enableAuthentication: toBoolean(process.env.APP_ENABLE_AUTHENTICATION, true),
  clientSecret: process.env.APP_CLIENT_SECRET || '',
  idra_base_url: process.env.APP_IDRA_BASE_URL || '',
  minio_base_url: process.env.APP_MINIO_BASE_URL || '',
  orion_ld_url_subscription: process.env.APP_ORION_LD_URL_SUBSCRIPTION || '',
  orion_ld_url_entity: process.env.APP_ORION_LD_URL_ENTITY || '',
  orion_ld_url_type: process.env.APP_ORION_LD_URL_TYPE || '',
  minio: process.env.APP_MINIO_HOST || '',
  minio_port: process.env.APP_MINIO_PORT || '443',
  access_key_minio: process.env.APP_ACCESS_KEY_MINIO || '',
  secret_key_minio: process.env.APP_SECRET_KEY_MINIO || '',
  url_airflow: process.env.APP_URL_AIRFLOW || '',
  url_minio: process.env.APP_URL_MINIO || '',
  googleMapsApiKey: process.env.APP_GOOGLE_MAPS_API_KEY || '',
  nbChatGoogleMapsApiKey: process.env.APP_NB_CHAT_GOOGLE_MAPS_API_KEY || process.env.APP_GOOGLE_MAPS_API_KEY || '',
};
