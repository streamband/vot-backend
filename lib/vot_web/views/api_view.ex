defmodule VotWeb.ApiView do
  use VotWeb, :view

  def render("index.json", %{data: data} = item) do
    %{
      status: "ok",
      data: data
    }
  end

  def render("error.json", %{data: data}) do
    %{
      status: "error",
      data: data
    }
  end

end
