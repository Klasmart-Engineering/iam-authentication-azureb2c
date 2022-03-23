to_entries | map("\(.key)=\(.value | @sh)") | join("\n")
