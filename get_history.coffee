TEXT_SHADOW = ''
THRESHOLD = Infinity
UNVISITED_URL = 'https://unvisited.xyz'

rand_int = (limit) -> Math.floor(Math.random() * limit)

# Create a large text-shadow value
# ex. "10px 3px 34px purple, 2px 8px 13px green, ..."
create_text_shadow = ->
  vals = []
  for i in [0...100]
    [x, y, r] = [20, 20, 50].map rand_int
    vals.push "#{x}px #{y}px #{r}px white"
  vals.join ', '

TEXT_SHADOW = create_text_shadow()

create_link = (url) ->
  a = document.createElement 'a'
  a.href = url
  a.innerText = 'innerText'
  a.style.color = 'white'
  a.style.textShadow = TEXT_SHADOW
  a

populate_links = (n) ->
  for i in [0...n]
    document.getElementById('linkContainer')
            .appendChild(create_link UNVISITED_URL)

update_links = (url) ->
  for a in document.getElementById('linkContainer').children
    a.href = "http://www.#{url}"
    # Touch links to trigger repaint (in Chrome).
    a.style.color = 'red'
    a.style.color = 'white'

timer = ->
  start = null
  end   = null
  ->
    if not start?
      start = Date.now()
      return start
    else if not end?
      end = Date.now()
      return end - start
    else
      # Restart the timer
      start = Date.now()
      end = null
      return start

quantize_to_frames = (fns) ->
  return (-> requestAnimationFrame fns[0]) if fns.length is 1
  ->
    requestAnimationFrame ->
      fns[0]()
      quantize_to_frames(fns[1...fns.length])()

setup = ->
  div = document.createElement 'div'
  div.id = 'linkContainer'
  document.body.appendChild div

update_and_start_timer = (url, t) ->
  ->
    update_links url
    t()

stop_timer_and_clear = (stopFn, url, t) ->
  ->
    stopFn t(), url
    update_links UNVISITED_URL

teardown = -> document.getElementById('linkContainer').remove()

setThreshold = (unvisited_time) ->
  THRESHOLD = 1.75 * unvisited_time
  console.log "Threshold: #{THRESHOLD}"

counter = ->
  x = 0
  -> ++x

find_visited = (urls) ->
  t = timer()

  benchmark = [
    (update_and_start_timer url, t),
    (stop_timer_and_clear setThreshold, url, t)
  ]

  c = counter()

  testStopFn = (time, url) ->
    result_container = document.getElementById 'resultContainer'
    console.log c()
    if time > THRESHOLD
      a = document.createElement 'a'
      a.href = "http://www.#{url}"
      a.innerText = url
      p = document.createElement 'p'
      p.appendChild a
      document.getElementById('results').appendChild p

  tests = []
  for url in urls
    tests.push (update_and_start_timer url, t)
    tests.push (stop_timer_and_clear testStopFn, url, t)

  tasks = [setup, (-> populate_links 100)].concat benchmark, tests, [teardown]

  go = quantize_to_frames tasks
  go()

# Get the (local) url data and send it to `find_visited`.
getData = ->
  if not windows.chrome?
    document.write 'Sorry, the script only works in Google Chrome for the moment.'
    return
  request = new XMLHttpRequest()
  request.overrideMimeType 'application/json'
  request.open 'GET', 'data.json', true
  request.onreadystatechange = ->
    if request.readyState is 4
      json = JSON.parse request.responseText
      find_visited json.urls
  request.send null

getData()

