export type User = {
  id: string;
  email: string;
  username: string;
};

type SubmissionStatus = {
  color: "red" | "emerald" | "";
  message: string;
  status: "error" | "success" | "";
};
