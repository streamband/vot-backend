defmodule VotWeb.PageController do
  use VotWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
