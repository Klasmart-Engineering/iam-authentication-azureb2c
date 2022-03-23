to_entries | map("\(.key)=\(.value)") | join("\n")
