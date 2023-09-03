import axios from "axios";
import qs from "qs";

const GITHUB_OAUTH_CLIENT_ID = process.env
  .GITHUB_OAUTH_CLIENT_ID as unknown as string;
const GITHUB_OAUTH_CLIENT_SECRET = process.env
  .GITHUB_OAUTH_CLIENT_SECRET as unknown as string;

type GitHubOauthToken = {
  access_token: string;
};

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: null;
  email: string;
  hireable: boolean;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

export const getGithubOathToken = async ({
  code,
}: {
  code: string;
}): Promise<GitHubOauthToken> => {
  const rootUrl = "https://github.com/login/oauth/access_token";
  const options = {
    client_id: GITHUB_OAUTH_CLIENT_ID,
    client_secret: GITHUB_OAUTH_CLIENT_SECRET,
    code,
  };

  const queryString = qs.stringify(options);

  try {
    const { data } = await axios.post(`${rootUrl}?${queryString}`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log(data);
    const decoded = qs.parse(data) as GitHubOauthToken;

    return decoded;
  } catch (err: any) {
    err.message = err.response.data.message;
    err.statusCode = err.response.status;
    throw err;
  }
};

export const deleteGithubOauthToken = async (
  access_token: string
): Promise<GitHubOauthToken> => {
  try {
    const { data } = await axios.delete(
      `https://api.github.com/applications/${GITHUB_OAUTH_CLIENT_ID}/token`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        data: {
          access_token,
        },
        auth: {
          username: GITHUB_OAUTH_CLIENT_ID,
          password: GITHUB_OAUTH_CLIENT_SECRET,
        },
      }
    );

    console.log(data);
    const decoded = qs.parse(data) as GitHubOauthToken;
    return decoded;
  } catch (err: any) {
    console.log(err);
    err.message = err.response.data.message;
    err.statusCode = err.response.status;
    throw err;
  }
};

export const getGithubOwnProfile = async ({
  access_token,
}: {
  access_token?: string;
}): Promise<GitHubUser> => {
  try {
    const { data } = await axios.get<GitHubUser>(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return data;
  } catch (err: any) {
    // console.log(err.response);
    err.message = err.response.data.message;
    err.statusCode = err.response.status;
    throw err;
  }
};
