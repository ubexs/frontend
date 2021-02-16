/*
$('#systemWideStatsArea').show();
$('head').append(`
        <style>
        .marquee {
            width: 100%;
            margin: 0 auto;
            white-space: nowrap;
            overflow: hidden;
            box-sizing: border-box;
          }
          
          .marquee span {
            display: inline-block;
            padding-left: 100%;
            animation: marquee 35s linear infinite;
          }
          
          .marquee span:hover {
            animation-play-state: paused
          }
          
          
          @keyframes marquee {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(-100%, 0);
            }
          }</style>`);
request('/staff/status/web', 'GET')
    .then(d => {
        $('#systemWideStatsArea').prepend(`
            <div class="col-12" style="padding:0;">
                <div class="card">
                    <div class="card-body" style="padding: 0.25rem;">
                        <p class="marquee">
                        
                            <span>
                            | Host: ${d.system.hostname} |  
                            
                            | Node Memory Usage: ${d.node.memory.gigabytes.used} GB (${d.node.memory.percentUsed}%) out of ${d.node.memory.gigabytes.total} GB allocated (${d.system.memory.gigabytes.total} GB altogether). | 
                            
                            | System Memory Usage: ${d.system.memory.gigabytes.used} GB (${d.system.memory.percentUsed}%) out of ${d.system.memory.gigabytes.total} GB altogether |

                            | PM2 Pool not configured. | 
                            
                            | Nginx/HAProxy/Cloudflare LB not configured. |
                            
                            | MYSQL: Pending Creates: ${d.node.mysql.pendingCreates} Free Pool Connections: ${d.node.mysql.numFree} Pending Connections: ${d.node.mysql.numPendingAcquires} |

                            </span>
                        </p>
                    </div>
                </div>
            </div>
        `);
    })
    .catch(e => {
        // err
        console.log(e);
    });
    */