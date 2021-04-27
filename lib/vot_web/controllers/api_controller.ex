defmodule VotWeb.ApiController do
  use VotWeb, :controller
  alias Vot.Accounts

  def auth(conn, %{"login" => login, "pass" => pass}) do
    if user = Accounts.get_user_by_email_and_password(login, pass) do
      token = Accounts.generate_user_session_token(user)
      render(conn, "index.json", data: %{token: Base.url_encode64(token)})
    else
      render(conn, "error.json", data: %{mess: "Invalid email or password"})
    end
  end

  def auth(conn, _) do
    render(conn, "error.json", data: %{mess: "email and password required"})
  end
end