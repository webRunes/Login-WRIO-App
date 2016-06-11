#!/bin/sh
if [ $TRAVIS_BRANCH == 'master' ]; then
  openssl aes-256-cbc -K $encrypted_8c393341f536_key -iv $encrypted_8c393341f536_iv -in deploy_key.enc -out deploy_key -d
  chmod 600 deploy_key
  mv deploy_key ~/.ssh/id_rsa
  git config user.email "AlexeyAnshakov@users.noreply.github.com"
  git config user.name "Alexey Anshakov"
  git checkout master
  node -e 'p=process;p.exit(p.argv[1]+p.argv[2]==="AlexeyAnshakov"?0:1)' `git log -1 --format='%an'` && npm version patch -m '%s[ci skip]';echo
  git remote set-url origin git@github.com:webRunes/Login-WRIO-App.git
  git push origin master
  rm ~/.ssh/id_rsa
fi
