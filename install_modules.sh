for d in */ ; do
  if [ -f "$d/package.json" ]; then
    (cd "$d" && npm i)
  fi
done
