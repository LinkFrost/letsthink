for d in */ ; do
  if [ -d "$d/node_modules" ]; then
    (cd "$d" && rm -r node_modules)
  fi
done