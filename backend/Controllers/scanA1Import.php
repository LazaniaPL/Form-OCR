<?php

	require_once (dirname(__FILE__)."/../config.php");
    require dirname(__DIR__) . '/vendor/autoload.php';
    use thiagoalessio\TesseractOCR\TesseractOCR;
   
    chdir(dirname(__DIR__) . "lokalizacja plików na serwerze");
    $files = glob( "*.pdf");
    
  
    
    $array= [0=>['nazwaPliku'=>"",'pesel'=>"",'dataRozpoczecia'=>"",'dataZakonczenia'=>"",'slowaKluczowe'=>""]]; // tutaj dodajemy pola które chcemy przechwycić z formularza
    $i = 0;
    foreach ($files as $file){
      $im = new Imagick();
      echo $file."<br>";
      
      //pliki są rózne a my musimy je zunifikować do jednego schematu
      $im->setResolution(200, 200);
      $im->readImage("$file"."[0]");
     //teoretycznie tutaj znajdą się ustawienia dodatkowe z menu, jaka rozdzielczość, czy zmienić na odcienie szarosci
      $im->setImageCompression(imagick::COMPRESSION_JPEG); 
      $im->setImageCompressionQuality(100);
      $im = $im->flattenImages();
      $im->setImageFormat("jpeg");

      $size = $im->getImageGeometry();

     
     
     //tutaj będzie schemat dla każdego pola co zaznaczyliśmy w menu i formularzu
     $im->cropImage(0.25*$size["width"],0.1*$size["height"],0.35*$size["width"],0.40*$size["height"]);
     
      ob_start();
      print $im->getImageBlob(); 
      $contents =  ob_get_contents();
      ob_end_clean();
    
      
      echo "<img src='data:image/jpeg;base64,".base64_encode($contents)."' />";
    $tem_image_name = 'lol.jpeg';
    //$im->paintTransparentImage();
      $im->writeImage($tem_image_name);

      

      //$forTesa = "<img src='data:image/jpeg;base64,".base64_encode($contents)."' />";
        //poniżej zaczynam rozpoznawać pesel
        //z racji tego że może wystąpić przeskok w formularzu spowodowany że raz zdjęcie jest wieksze, raz mniejsze
        // przykładowo litera "l" może zostać odczytana jako cyfra "1" albo kombinacja "l:" jako cyfra "6"
        //dlatego puszczam przez whiteliste oraz testuje wszystkie wykryte kombinacje znaków
        $temp =  (new TesseractOCR('lol.jpeg'))
        
        ->lang('pol')
        ->psm(6)
        ->whitelist('0123456789')
      
     
        ->run()
         ;
        
        preg_match_all("/(?=(\d{11}))/", $temp,$peselTempArray);
        $peselArr = "";
        print_r($peselTempArray);
        foreach ($peselTempArray[1] as $key => $itr_pesel){
			if (validate_pesel($itr_pesel)){
				$peselArr=$itr_pesel;
			  break;
            }


			print_r($peselArr);

      //koniec rozpoznawania peseli
        }
   

        //w moim przypadku pliki miały nazwy dat, dlatego wolałem najpierw sprawdzić czy da rozpoznać date z nazwy
        //zanim uruchamiałem ocr do dat
      preg_match_all("/\d\d[ \s\.\-\_\/]+\d\d[ \s\.\-\_\/]+\d\d\d\d/", $file,$firstArr);
     // print_r($firstArr);
      preg_match_all("/\d\d\d\d[ \s\.\-\_\/]+\d\d[ \s\.\-\_\/]+\d\d/", $file,$secondArr);
     // print_r($secondArr);

          if (count($firstArr[0])>count($secondArr[0])&count($firstArr[0])>=2 ){
              $dataArr[0] = preg_replace("/a+/",'-',str_replace(['\\','/',' ',':','.','_','-'],'a',$firstArr[0]));
              
              //print_r($dataArr);
      }elseif (count($firstArr[0])<count($secondArr[0])&count($secondArr[0])>=2) {
        $dataArr[0] =preg_replace("/a+/",'-', str_replace(['\\','/',' ',':','.','_','-'],'a', $secondArr[0]));
       //print_r($dataArr);
      } else

      

      //    if (empty($dataArr[0][0] )|| empty($dataArr[0][1] ) ||
       //d    ate('Y-m-d', strtotime($dataArr[0][0]))=='1970-01-01' ||date('Y-m-d', strtotime($dataArr[0][1]))=='1970-01-01' ) 
       {
        $im->readImage("$file"."[0]");
        //$im->whiteThresholdImage('black');
        $im->setImageCompression(imagick::COMPRESSION_JPEG); 
        $im->setImageCompressionQuality(100);
        $im = $im->flattenImages();
        $im->setImageFormat("jpeg");
        
        $im->cropImage(0.6*$size["width"],0.1*$size["height"],0.25*$size["width"],0.7*$size["height"]);

        ob_start();
      print $im->getImageBlob(); 
      $contents =  ob_get_contents();
      ob_end_clean();
     // base64_encode($contents);
      
      //echo "<img src='data:image/jpeg;base64,".base64_encode($contents)."' />";
    $tem_image_name = 'date.jpeg';
    //$im->paintTransparentImage();
      $im->writeImage($tem_image_name);



        $tempDate =  (new TesseractOCR('date.jpeg'))
        
        ->lang('pol')
        ->psm(6)
        ->whitelist("\/-0123456789")
      
     
        ->run()
         ;
         
         
         //tutaj musiałem zrobić niestety magic number, bo w moim formularzu wyglądało to tak:
              // 2.2 Data rozpoczęcia   2020-05-26      2.3 Data zakończenia   2021-05-25
         // podpunkt 2.3 zostawał sczytywany i łączony do daty i nie dawało się sparsować 
         $slash = '\/';
         $tempDate = str_replace('/','-',$tempDate);
         $tempDate = str_replace(' ','',$tempDate);
         $tempDate = str_replace('-23','-aa',$tempDate);
         $tempDate = str_replace('23-','aa-',$tempDate);
         $tempDate = str_replace('23',' 23 ',$tempDate);
         $tempDate = str_replace('aa','23',$tempDate);
         echo $tempDate . "<br>";
         preg_match_all("/\d\d[-]+\d\d[-]+\d\d\d\d|\d\d\d\d[-]+\d\d[-]+\d\d/", $tempDate,$dataArr);
         // print_r($dataArr);
         $dataArr[0][0] = str_replace(' ','',$dataArr[0][0]);
         $dataArr[0][1] = str_replace(' ','',$dataArr[0][1]);
         //print_r($dataArr);

      }
     //tutaj poprostu czyszcze nazwe pliku
      
      $regexInput =preg_replace("/0+/",'-',str_replace(['\\','/',' ',':','.','_','-','a1','pdf','1','2','3','4','5','6','7','8','9'],'0',strtolower($file)));
      preg_match_all("/[^-]+-[^-]+/",$regexInput,$regexFile);

        $array[$i]=[
		'nazwaPliku'=>$file,
        'pesel'=>$peselArr,
        'dataRozpoczecia'=>$dataArr[0][0],
        'dataZakonczenia'=>$dataArr[0][1],
        'slowaKluczowe'=>$regexFile[0][0]];
		//print_r($array[$i]);
		    if (insertToDatabase($array[$i]) > 0) {
			    unlink($tem_image_name);
    }
        unset($im);
        unset($temp);
        unset($tempDate);
        $i = $i + 1 ;
    }
	function insertToDatabase($array){
		global $pdo;
		echo "zaczynam wysylke <br>";

		try{
			$pdo->beginTransaction();
      $params = array(':nazwaPliku' => $array['nazwaPliku'], ':pesel' => $array['pesel'], ':dataRozpoczecia' => date('Y-m-d', strtotime($array['dataRozpoczecia'])), ':dataZakonczenia' => date('Y-m-d', strtotime($array['dataZakonczenia'])),
    ':slowaKluczowe'=>$array['slowaKluczowe']);
			$sql_A1="INSERT INTO A1_import_dev (aid_name, aid_pesel, aid_date_begin, aid_date_end,aid_key_words) VALUES (:nazwaPliku, :pesel, :dataRozpoczecia, :dataZakonczenia,:slowaKluczowe)";
			$stmt_A1=$pdo->prepare($sql_A1);
			$stmt_A1->execute($params);
			$pdo->commit();
			return $stmt_A1->rowCount();
		  }
		  catch (\Exception $e){
			throw $e;
			$pdo->rollback();
			die();
		  }
		  echo "koniec";
	}
	
	function validate_pesel($pesel_Value){
		$pesel  = array_map('intval', str_split($pesel_Value));
		if (!preg_match('/^[0-9]{11}$/',$pesel_Value)) {
			// sprawdzamy, czy dane wejściowe są jedenastoznakową liczbą
			//$err_message = 'Numer PESEL musi zawierać 11 cyfr!';
			//form_set_error('error', $err_message);
			return FALSE;
		}
		
		// Sprawdzanie miesięcy
		$month = (int)$pesel[2] . $pesel[3];
		if ( (12 < $month && $month < 21) || (33 < $month && $month < 41) || (52 < $month && $month < 61) ||
			 (72 < $month && $month < 81) || $month > 92 ) {
			return false;
		}
		
		$weights = array(1, 3, 7, 9, 1, 3, 7, 9, 1, 3);
		// tutaj mamy kolejne wagi pierwszych dziesięciu cyfr
		$sum = 0;
		for ($i = 0; $i < 10; $i++) {
			$sum += $weights[$i] * $pesel[$i];
			// jak w poprzednich wpisach, wyliczamy sumę kontrolną w taki sam sposób - przemnażając kolejne cyfry numeru przez odpowiadające im wagi
		}
		$int = 10 - $sum % 10;
		$checksum = ($int == 10) ? 0 : $int;
		// jeśli różnica z dzielenia sumy kontrolnej jest równa liczbie '10', za wartość uznajemy zero (0)
			if ($checksum == $pesel[10]) {
				return true;
		// no i jak to na końcu walidacji przystało, sprawdzamy czy sumy kontrolne (obliczona i zawarta w numerze PESEL) zgadzają się :)
		}
		//$err_message = 'Błędna suma kontrolna! Nr PESEL jes nieprawidłowy';
		//form_set_error('error', $err_message);
		return FALSE;	
	}
?>