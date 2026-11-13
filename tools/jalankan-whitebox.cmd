@echo off
setlocal
pushd "%~dp0.."
node "tests\whitebox-skripsi-20.mjs" %*
set "whitebox_exit_code=%errorlevel%"
popd
exit /b %whitebox_exit_code%
