import axios from "axios";
import { GitHubUser } from "./session.service";

//api.github.com/users/
export const getGithubUserProfile = async (
  username: string
): Promise<GitHubUser> => {
  try {
    const { data } = await axios.get<GitHubUser>(
      `https://api.github.com/users/${username}`
    );
    console.log(data);
    return data;
  } catch (err: any) {
    // console.log(err.response);
    err.message = err.response.data.message;
    err.statusCode = err.response.status;
    throw err;
  }
};
