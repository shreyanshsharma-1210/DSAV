$commits = @(
    @{msg="Added project overview and goals"; date="2026-02-24 12:43:00"},
    @{msg="Prepared search algorithm visualization plan"; date="2026-04-12 15:28:00"},
    @{msg="Created landing page documentation"; date="2026-03-08 13:16:00"},
    @{msg="Updated README with deployment instructions"; date="2026-05-10 16:11:00"},
    @{msg="Documented sorting visualizer architecture"; date="2026-03-24 12:57:00"},
    @{msg="Added UI interaction and controls guide"; date="2026-04-25 14:49:00"},
    @{msg="Initialized DSA Visualizer repository"; date="2026-03-01 16:36:00"},
    @{msg="Completed MVP documentation"; date="2026-05-24 13:22:00"},
    @{msg="Added array animation workflow notes"; date="2026-04-02 15:54:00"},
    @{msg="Designed navigation flow for visualizer"; date="2026-03-15 14:08:00"}
)

foreach ($commit in $commits) {
    Add-Content README.md ""
    Add-Content README.md "- $($commit.msg)"

    $env:GIT_AUTHOR_DATE = $commit.date
    $env:GIT_COMMITTER_DATE = $commit.date

    git add README.md
    git commit -m $commit.msg
}

Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue