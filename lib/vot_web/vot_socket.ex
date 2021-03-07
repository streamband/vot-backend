defmodule VotWeb.VotSocket do
  @behaviour Phoenix.Socket.Transport
  use Ecto.Schema
  import Ecto.Changeset
  import Jason
  alias Vot.Repo
  alias Vot.Event

  def child_spec(opts) do
    # We won't spawn any process, so let's return a dummy task
    IO.inspect {"=====opts", opts}
    %{id: Task, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(map) do
    # Callback to retrieve relevant data from the connection.
    # The map contains options, params, transport and endpoint keys.
    IO.inspect {self, map}
    {:ok, map}
  end

  def init(state) do
    # Now we are effectively inside the process that maintains the socket.
    {:ok, Map.put(state, :sess_id, nil)}
  end

  def handle_in({text, opts}, %{sess_id: sess_id} = state) do
    IO.inspect {"handle_in", {text, opts, state}}
    case handle_msg(decode(text), sess_id) do
      {:ok, :join, new_sess_id} ->
        {:ok, %{state | sess_id: new_sess_id}}
      {:ok, json} ->
        {:reply, :ok, {:text, json}, state}
      :ok ->
        {:ok, state}
      _ ->
        {:reply, :ok, {:text, response_error()}, state}
    end
  end

  def handle_control(msg, state) do
    IO.inspect {"handle_in", msg}
    {:ok, state}
  end

  def handle_info(msg, state) do
    IO.inspect {"handle_info", msg}
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok
  end

  defp handle_msg({:ok, %{"ref" => ref} = msg}, sess_id) do
    IO.inspect {"msg", msg}
    case msg do
      %{"event" => "meta", "topic" => "join", "payload" => payload} ->
        sess = UUID.uuid1()

        %{"browser" => browser,
          "device" => device,
          "os" => os} = payload

        Event.changeset(%Event{}, %{
          :type => "sys",
          :event => "join",
          # TODO: get ip
          :ip => "127.0.0.1",
          :session => sess,
          :browser => browser,
          :device => device,
          :os => os
        }) |> Repo.insert()
        {:ok, :join, sess}
      %{"event" => "meta", "topic" => "init", "payload" => payload} ->
        data = %{
          :type => "sys",
          :event => "init",
          :session => sess_id,
          :video_id => Map.get(payload, "video_id", ""),
          :video_name => Map.get(payload, "video_name", ""),
          :video_type => Map.get(payload, "video_type", ""),
          :category_name => Map.get(payload, "category_name", ""),
          :sub_category_name => Map.get(payload, "sub_category_name", ""),
          :duration => Map.get(payload, "duration", 0),
          :clientWidth => Map.get(payload, "clientWidth", 0),
          :clientHeight => Map.get(payload, "clientHeight", 0),
          :src => Map.get(payload, "src", "")
        }
        Event.changeset(%Event{}, data) |> Repo.insert()
        :ok
      %{"event" => "event", "topic" => "player", "payload" =>  %{"event" => "error", "code" => code}} ->
        Event.changeset(%Event{}, %{
          :type => "player",
          :event => "error",
          :session => sess_id,
          :event_code => code
        }) |> Repo.insert()
        :ok
      %{"event" => "event", "topic" => "player", "payload" =>  %{"event" => event}} ->
        Event.changeset(%Event{}, %{
          :type => "player",
          :event => event,
          :session => sess_id
        }) |> Repo.insert()
        :ok
      _ ->
        response_ok(ref) |> encode()
    end
  end

  defp handle_msg(msg, _) do
    IO.inspect {"undef msg", msg}
    encode(%{status: :error})
  end

  defp response_error() do
    {_, res} = encode(%{status: :error})
    res
  end

  defp response_ok(ref) do
    {_, res} = encode(%{
      event: "reply",
      payload: %{response: %{}, status: "ok"},
      ref: ref,
      topic: "sys"
    })
    res
  end
end
