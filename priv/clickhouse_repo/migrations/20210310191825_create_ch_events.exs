defmodule Vot.ClickhouseRepo.Migrations.CreateChEvents do
  use Ecto.Migration

  def change do
    create_if_not_exists table(:events, engine: "MergeTree() PARTITION BY toYYYYMM(timestamp) ORDER BY (client_id, video_id, timestamp) SETTINGS index_granularity = 8192") do
      add :token, :string
      add :client_id, :string
      add :viewer_id, :string

      add :ab_name, :string
      add :sub_ab_name, :string

      add :player_name, :string
      add :player_version, :string

      add :video_id, :string
      add :video_name, :string
      add :video_type, :string # live/vod
      add :video_stream_type, :string # hls/dash/vp9...
      add :video_duration, :UInt64
      add :video_size, :string #WxH
      add :video_src, :string
      add :video_bitrate, :UInt64 # Mbit/s

      add :device_type, :string
      add :device_os, :string
      add :device_browser, :string
      add :device_player, :string
      add :device_screen_size, :string # WxH

      add :event_type, :string # sys / player
      add :event_name, :string # connect / disconnect / init (player) / html5 events + custom ...Server side data

      add :ip, :string
      add :session_start, :string
      add :session_duration, :UInt64 # seconds
      add :user_agent, :string
      add :session_id, :string

      add :timestamp, :naive_datetime
    end
  end
end
