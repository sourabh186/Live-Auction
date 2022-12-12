const port = 3005;
const baseURL = `http://localhost:${port}`;
const config = {
  // The secret for the encryption of the jsonwebtoken
  JWTsecret: 'mysecret',
  baseURL: baseURL,
  port: port,
  // The credentials and information for OAuth2
  oauth2Credentials: {
    client_id: "218760657503-hv54lma61ne6gg2ubo1ipbrq36ffctev.apps.googleusercontent.com",
    project_id: "online-Auction-System", // The name of your project
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "KlfhpGHHy_C60GTpCdtCo1O1",
    redirect_uris: [
      `${baseURL}/auth_callback`
    ],
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly'
    ]
  }
};

module.exports = config;
