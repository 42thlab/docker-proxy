class Docker::API::Containers < Docker::API
  prefix: :containers

  reroute :get, %w(
    /ps
    /json
    /:id/export
    /:id/changes
    /:id/json
    /:id/top
    /:id/logs
    /:id/stats
    /:id/attach/ws
  )

  reroute :post, %w(
    /create
    /:id/kill
    /:id/attach
    /:id/pause
    /:id/unpause
    /:id/rename
    /:id/restart
    /:id/start
    /:id/stop
    /:id/wait
    /:id/resize
    /:id/copy
    /:id/exec
  )

  reroute :delete, %w( /:id )
end
