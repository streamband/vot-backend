defmodule Vot.Proto do

  defmodule EventType do
    defstruct(
      sys: 0,
      player: 1,
      close: 2
    )
  end

  defmodule PlayerEvent do
    defstruct(
      error: 0,
      stop: 1,
      init: 2,
      play: 3,
      pause: 4,
      buffering: 5
    )
  end

  defmodule Payload do
    defstruct [:event, :code, :message]
  end

  defmodule Message do
    defstruct [:event, payload: %Payload{}]
  end

  def player_event(code) do
    case code do
      0 -> :error
      1 -> :stop
      2 -> :init
      3 -> :play
      4 -> :pause
      5 -> :buffering
      _ -> nil
    end
  end

  def event_type(code) do
    case code do
      0 -> :sys
      1 -> :player
      2 -> :close
      _ -> nil
    end
  end

  def decode_payload(payload) do
    %Payload {
      event: player_event(payload[:e]),
      code: payload[:c],
      message: payload[:m]
    }
  end

  def decode(msg) do
    %Message{
      event: event_type(msg[:e]),
      payload: decode_payload(msg[:p])
    }
  end

end