defmodule Vot.ProtoTest do
  use ExUnit.Case

  @encoded_msg  %{e: 1, p: %{e: 0, c: 1, m: ""}}

  setup do
    {:ok, test_state: Vot.Proto.decode(@encoded_msg)}
  end

  test "decode event", %{test_state: test_state} do
    assert test_state.event == :player
  end

  test "decode payload event", %{test_state: %{payload: payload}} do
    assert payload.event == :error
  end

end