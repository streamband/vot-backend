defmodule Vot.Models.ClickhouseEvent do
  use Ecto.Schema
  import Ecto.Changeset

  schema "events" do
    field :token, :string
    field :client_id, :string
    field :viewer_id, :string
    field :ab_name, :string
    field :sub_ab_name, :string
    field :player_name, :string
    field :player_version, :string
    field :video_id, :string
    field :video_name, :string
    field :video_type, :string
    field :video_stream_type, :string
    field :video_duration, :integer
    field :video_size, :string
    field :video_src, :string
    field :video_bitrate, :integer
    field :device_type, :string
    field :device_os, :string
    field :device_browser, :string
    field :device_player, :string
    field :device_screen_size, :string
    field :event_type, :string
    field :event_name, :string
    field :ip, :string
    field :session_start, :string
    field :session_duration, :integer
    field :user_agent, :string
    field :session_id, :string
    timestamps(inserted_at: :timestamp, updated_at: false)
  end

  def changeset(event, attrs) do
    event
    |> cast(attrs, [
      :token,
      :client_id,
      :viewer_id,
      :ab_name,
      :sub_ab_name,
      :player_name,
      :player_version,
      :video_id,
      :video_name,
      :video_type,
      :video_stream_type,
      :video_duration,
      :video_size,
      :video_src,
      :video_bitrate,
      :device_type,
      :device_os,
      :device_browser,
      :device_player,
      :device_screen_size,
      :event_type,
      :event_name,
      :ip,
      :session_start,
      :session_duration,
      :user_agent,
      :session_id
    ])
    |> validate_required([:client_id, :video_id])
  end
end