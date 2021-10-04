@Echo off

setlocal enableDelayedExpansion
echo Transfert automatique de fichiers
echo.
:: Heure du d‚but
SET HeureDebut=%TIME%
set date=%date:~0,2%-%date:~3,2%-%date:~6,2%
set heure_debut=%time:~0,2%:%time:~3,2%:%time:~6,2%
set /a temps_debut=(%time:~0,2%*3600)+(%time:~3,2%*60)+(%time:~6,2%)

:: On definit la source des fichiers
SET source=%cd%\Kit_cle_USB\
echo Source sur : %source%
echo Liste : 
set cnt=0
for %%a in ("%source%"*) do (
  echo %%a
  set /a cnt+=1
)
echo Il y a %cnt% fichier(s) a transf‚rer

echo =================================================
echo.

set nbre=0
for /f "skip=1 tokens=1,2" %%i in ('wmic logicaldisk get caption^, drivetype') do (
  if [%%j]==[2] (
  	IF EXIST %%i (
  		set nbreFichiers=0
		set /a nbre+=1
		echo lecteur %%i disponible
		convert %%i /fs:ntfs /x
		echo Conversion en NTFS OK
		label %%iREDON Agglom‚ration
		echo Le lecteur %%i est renomm‚ en REDON Agglom‚ration

		echo D'abord on efface tout
		DEL %%i\ /Q
		echo La carte est vid‚e, maintenant on va transf‚rer les fichiers
		for %%a in ("%source%"*) do (
		 ::echo %%a
		 xcopy "%%a" %%i\ /i
		 set /a nbreFichiers+=1
		)
		echo !nbreFichiers! fichiers transf‚r‚s sans probleme sur %%i\
		echo =================================================
  	)

	

	)
)
COLOR 02
:::
:::  ______   _______  _______           _______ 
::: (  ___ \ (  ____ )(  ___  )|\     /|(  ___  )
::: | (   ) )| (    )|| (   ) || )   ( || (   ) |
::: | (__/ / | (____)|| (___) || |   | || |   | |
::: |  __ (  |     __)|  ___  |( (   ) )| |   | |
::: | (  \ \ | (\ (   | (   ) | \ \_/ / | |   | |
::: | )___) )| ) \ \__| )   ( |  \   /  | (___) |
::: |/ \___/ |/   \__/|/     \|   \_/   (_______)                                          
:::         _________         _________ _______  _        _______ 
::: |\     /|\__   __/|\     /|\__   __/(  ___  )( (    /|(  ____ \
::: | )   ( |   ) (   | )   ( |   ) (   | (   ) ||  \  ( || (    \/
::: | |   | |   | |   | |   | |   | |   | (___) ||   \ | || (__    
::: ( (   ) )   | |   ( (   ) )   | |   |  ___  || (\ \) ||  __)   
:::  \ \_/ /    | |    \ \_/ /    | |   | (   ) || | \   || (      
:::   \   /  ___) (___  \   /  ___) (___| )   ( || )  \  || (____/\
:::    \_/   \_______/   \_/   \_______/|/     \||/    )_)(_______/
:::
::"les heures, minutes et secondes"
set /a fh=%time:~0,2%
set /a fm=%time:~3,2% 
set /a fs=%time:~6,2%
for /f "delims=: tokens=*" %%A in ('findstr /b ::: "%~f0"') do @echo(%%A
echo Tu as copi‚ %cnt% fichiers sur !nbre! clefs USB
SET HeureFin=%TIME%
echo debut de la copie a !HeureDebut!
echo Fin a !HeureFin!

:: Calcul du chrono
set heure_fin=%time:~0,2%:%time:~3,2%:%time:~6,2%
set /a temps_fin=((%time:~0,2%*3600)+(%time:~3,2%*60)+(%time:~6,2%))
set /a temps_total=(%temps_fin%-%temps_debut%)
set /a temps_total_divise=%temps_total%/60
set /a second=%temps_total%/60
set /a seconde=%second%*60
set /a secondes=%temps_total%-%seconde%

echo Op‚ration r‚alis‚e en : %temps_total_divise% minutes %secondes% secondes
echo =================================================
echo.
echo.



pause