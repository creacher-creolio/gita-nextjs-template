# GIT COMMANDS

```bash
## BEGINNER COMMANDS ##
git status  # see changes
git add .  # necessary when adding or deleting files
git commit -m "<some message>"  # runs pre-commit if installed
git commit -m "<some message>" --no-verify  # skips pre-commit
git push
git pull
git branch  # list all branches
git checkout -b <branchName>  # create a new branch
git checkout <branchName>  # switch to a branch
git checkout -  # switch to last branch
git branch -D <branchName>  # delete a branch

## INTERMEDIATE COMMANDS ##
### Stashing
git add . # add all changes to the staging area (necessary for stashing and committing)
git stash # save changes to the top layer of a temporary stash
git stash pop # get changes from the top layer of the stash and apply them
git stash list # list all stashes
git stash drop # delete the top layer of the stash
git stash clear # delete all stashes

### Switching
git switch <branchName>  # store changes and apply them to the branch you're switching to; create branch at the same time if doesn't exist
git switch -c <branchName>  # switch while creating a new branch

###
git config --global push.default current
git config --global push.autoSetupRemote origin

### Aliases
git config --global alias.ca '!git add . && git commit -m'  # create an alias command that adds and commits at the same time
git ca "<some message>"
git config --global alias.sa '!git add . && git stash'  # create an alias command that adds and stashes at the same time
git sa
git config --global alias.sp '!git stash pop'  # create an alias command that pops the top layer of the stash
git sp
git config --global alias.nb '!f() { git checkout -b jonathanknebel/$1; }; f'  # create an alias command that creates and switches to a new branch with your github username as a prefix
git nb 'testBranch'

### File Management
git rm <some file> --cached  # remove a file from git while keeping it locally
git rm -r --cached <file/folder>  # remove a file or folder from the repo, but not the local filesystem
git rm -r <file/folder>  # remove a file or folder from the repo AND delete from the local filesystem

### Branch Management
git reset HEAD~ # undo last commit (keeps changes)
git push --delete origin <branchName>  # delete a remote branch
git merge --abort  # abort a merge
git diff <new-branch>..<old-branch>  # check if any commits inside the one branch are in the other (great for preparing to delete old branches that you're not sure are OK to delete)
git branch --no-merged main  # lists all local branches that have commits not merged into main
git branch --merged main  # lists all local branches that have been merged into main
git branch --merged main | xargs git branch -d # removes all local branches that are already merged into main

## ADVANCED COMMANDS ##
git reset master # !!!CAREFUL!!!: sets the head of master to the current branch--useful if you want to revert to an old commit by checking out the old commit hash as a branch and then copying that spot in the history to the top of the head/history
git reflog # a way to undo resets and rebases
git checkout --theirs -- databases/shared/dev.sqlite3  # useful if you want to just accept the incoming file on a merge conflict
git log -S <some string>  # search the commit history for a string
git log <new-branch>..<old-branch>  # check if any commits inside the one branch are in the other (great for preparing to delete old branches that you're not sure are OK to delete)
git rebase -i HEAD~n  # interactive rebase, where n is the number of commits you want to rebase (useful for squashing commits)

### Bisect (great for debugging)
git bisect start # start a binary search to find the commit that introduced a bug
git bisect bad # mark the current commit as bad (usually the first action after starting a bisect; add the commit hash as an argument to mark a specific commit as bad)
git bisect good <commit hash> # mark a specific commit as good (usually the second action after marking the current commit as bad; don't add the commit hash as an argument to mark the current commit as good)
git bisect reset # exit the bisect process

### REVERT
git revert <commit hash> --no-commit # revert a commit without committing (safest)
git revert <commit hash>  # revert a commit and commit
git revert <commit hash>..HEAD # revert a range of commits and commit

### !!! BE CAREFUL WITH THESE!!!
git remote update --prune  # deletes all remote branches that have been deleted on the remote

#### RESET
git reset --hard <commit hash>  # resets the head to the commit hash, and deletes all commits after that point
git push --force # force push to remote (updates remote to reflect the local reset)
```
