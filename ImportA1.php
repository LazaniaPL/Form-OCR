<?php
	require_once (dirname(__FILE__)."/../config.php");
	require dirname(__DIR__) . '/vendor/autoload.php';
	
	use \Firebase\JWT\JWT;
	use PhpOffice\PhpSpreadsheet\Spreadsheet;
	use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
	use PhpOffice\PhpSpreadsheet\Writer\Csv;
	use PhpOffice\PhpSpreadsheet\IOFactory;
	
	$file = 'upload/ones_to_import.xlsx';
	if ( filesize($file)){
		$spreadsheet = IOFactory::load($file);
		$highestRow = $spreadsheet->getActiveSheet()->getHighestRow();
		echo 'Ilość ! z excel: ' . $highestRow . '<br>';
		$i = 0;
		$updated = 0;
		$inserted = 0;
		$rozpoznanych = 0;
		/* Pobieranie wszytskich opiekunek żeby znaleźć pesel */
		
		$sql_caretakers = "SELECT crt_id_caretaker, crt_pesel FROM caretakers WHERE crt_pesel IS NOT NULL";
		$stmt_caretakers = $pdo->query($sql_caretakers);
		$stmt_caretakers->execute();
		$caretakers = $stmt_caretakers->fetchAll(PDO::FETCH_ASSOC);
		
		// Pobieranie wszystkich A1
		
		$sql_ones = "SELECT one_id_a1, one_id_company, one_id_caretaker, one_start_date, one_end_date, one_id_type FROM A1";
		$stmt_ones = $pdo->query($sql_ones);
		$stmt_ones->execute();
		$ones = $stmt_ones->fetchAll(PDO::FETCH_ASSOC);
		
		try {
			$pdo->beginTransaction();
			for ($row = 6 ; $row <= $highestRow; $row++){
				$i++;
				$company = $spreadsheet->getActiveSheet()->getCell('B'.$row)->getValue();
				$pesel = $spreadsheet->getActiveSheet()->getCell('G'.$row)->getValue();
				$a1_state = $spreadsheet->getActiveSheet()->getCell('D'.$row)->getValue();
				$a1_type = $spreadsheet->getActiveSheet()->getCell('C'.$row)->getValue();
				$a1_from = $spreadsheet->getActiveSheet()->getCell('H'.$row)->getValue();
				$a1_to = $spreadsheet->getActiveSheet()->getCell('I'.$row)->getValue();
				$a1_submission = $spreadsheet->getActiveSheet()->getCell('J'.$row)->getValue();
				$a1_receive = $spreadsheet->getActiveSheet()->getCell('K'.$row)->getValue();
				$a1_own_ekuz = $spreadsheet->getActiveSheet()->getCell('L'.$row)->getValue() == 'tak' ? 1 : null;
				$a1_comment = $spreadsheet->getActiveSheet()->getCell('M'.$row)->getValue();
				$ekuz_submission = $spreadsheet->getActiveSheet()->getCell('N'.$row)->getValue();
				$ekuz_receive_date = $spreadsheet->getActiveSheet()->getCell('O'.$row)->getValue();
				$ekuz_send_date = $spreadsheet->getActiveSheet()->getCell('R'.$row)->getValue();
				$ekuz_comment = $spreadsheet->getActiveSheet()->getCell('Q'.$row)->getValue();
				
				/* znajź id opienunki */
				foreach($caretakers as $caretaker){
					if ( $caretaker['crt_pesel'] == $pesel){
						$caretaker_id = $caretaker['crt_id_caretaker'];
						break;
					}
				}
				
				/* sprawdź czy jest juz taka a1	*/
				$one_id = null;
				foreach($ones as $one_key => $one){
					$date1=date_create($one['one_start_date']);
					$date2=date_create($a1_from);
					$diff=date_diff($date1,$date2);
					if ($one['one_id_company'] == $company && $one['one_id_caretaker'] == $caretaker_id && -90 <= $diff->days && $diff->days <= 90 && $a1_type !=3){
						echo 'Z Excel: ' . $a1_from . ' z bazy: ' . $one['one_start_date'] . ' Różnica dat: ' . $diff->days . '<br>';
						echo 'znaleziono: ' . $one_id . ' pesel: ' . $pesel . ' data złożenia: ' . $a1_submission . ' data otrzymania: ' . $a1_receive . '<br>';
						$rozpoznanych++;
						$one_id = $one['one_id_a1'];
						break;
					}
					
					if ($one_key == (count($ones) - 1)){
						echo 'Nie znaleziono: ' . $one_id . ' pesel: ' . $pesel . ' A1 od: ' . $a1_from . ' data złożenia: ' . $a1_submission . ' data otrzymania: ' . $a1_receive . '<br>';
					}
				}
				if (isset($one_id)){
					$updated++;
					$a1_params = array(':one_id_a1' => $one_id, ':one_id_type' => $a1_type, ':one_id_a1_status' => $a1_state, ':one_start_date' => $a1_from, ':one_end_date' => $a1_to, ':one_submission_date' => $a1_submission,
										':one_receive_date' => $a1_receive, ':one_own_ekuz' => $a1_own_ekuz, ':one_comment' => $a1_comment);
					$a1_sql = "UPDATE A1 SET one_id_type = :one_id_type, one_id_a1_status = :one_id_a1_status, one_comment = :one_comment, one_start_date = :one_start_date, one_end_date = :one_end_date,
											one_submission_date = :one_submission_date, one_receive_date = :one_receive_date, one_own_ekuz = :one_own_ekuz, one_imported = 1
								WHERE one_id_a1 = :one_id_a1";
					$a1_stmt = $pdo->prepare($a1_sql);
					$a1_stmt->execute($a1_params);
					$a1_id = $one_id;
					
					if ($ekuz_submission != ''){
						// sprawdz czy juz jest ekuz_params
						$old_ekuz_params = array(':ekz_id_a1' => $a1_id);
						$old_ekuz_sql = "SELECT * FROM EKUZ WHERE ekz_id_a1 = :ekz_id_a1";
						$old_ekuz_stmt = $pdo->prepare($old_ekuz_sql);
						$old_ekuz_stmt->execute($old_ekuz_params);
						if ($old_ekuz_stmt->rowCount() > 0){
							$ekuz_params = array(':ekz_id_a1' => $a1_id, ':ekz_start_date' => $a1_from, ':ekz_end_date' => $a1_to, ':ekz_submission_date' => $ekuz_submission);
							$ekuz_sql = "UPDATE EKUZ SET ekz_start_date = :ekz_start_date, ekz_end_date = :ekz_end_date, ekz_submission_date = :ekz_submission_date
										 WHERE ekz_id_a1 = :ekz_id_a1";
						} else {
							$ekuz_params = array(':ekz_id_a1' => $a1_id, ':ekz_start_date' => $a1_from, ':ekz_end_date' => $a1_to, ':ekz_submission_date' => $ekuz_submission);
							$ekuz_sql = "INSERT INTO EKUZ (ekz_id_a1, ekz_start_date, ekz_end_date, ekz_submission_date, ekz_id_user_employee)
										 VALUES (:ekz_id_a1, :ekz_start_date, :ekz_end_date, :ekz_submission_date, 1)";
						}
						$ekuz_stmt = $pdo->prepare($ekuz_sql);
						$ekuz_stmt->execute($ekuz_params);
					}
				} else {
					$inserted++;
					$a1_params = array(':one_id_company' => $company, 'one_id_caretaker' => $caretaker_id, ':one_id_type' => $a1_type, ':one_id_a1_status' => $a1_state, ':one_start_date' => $a1_from, ':one_end_date' => $a1_to, ':one_submission_date' => $a1_submission,
										':one_receive_date' => $a1_receive, ':one_own_ekuz' => $a1_own_ekuz, ':one_comment' => $a1_comment);
					$a1_sql = "INSERT INTO A1 (one_id_company, one_id_caretaker, one_id_type, one_id_a1_status, one_comment, one_start_date, one_end_date, one_submission_date, one_receive_date, one_own_ekuz, one_id_user_employee, one_imported)
								VALUES (:one_id_company, :one_id_caretaker, :one_id_type, :one_id_a1_status, :one_comment, :one_start_date, :one_end_date, :one_submission_date, :one_receive_date, :one_own_ekuz, 1, 1)";
					$a1_stmt = $pdo->prepare($a1_sql);
					$a1_stmt->execute($a1_params);
					$a1_id = $pdo->lastInsertId();
					
					if ($ekuz_submission != ''){
						$ekuz_params = array(':ekz_id_a1' => $a1_id, ':ekz_start_date' => $a1_from, ':ekz_end_date' => $a1_to, ':ekz_submission_date' => $ekuz_submission, ':ekz_comment' => $ekuz_comment, ':ekz_receive_date' => $ekuz_receive_date,
											':ekz_send_date' => $ekuz_send_date);
						$ekuz_sql = "INSERT INTO EKUZ (ekz_id_a1, ekz_start_date, ekz_end_date, ekz_submission_date, ekz_id_user_employee, ekz_comment, ekz_receive_date, ekz_send_date)
									 VALUES (:ekz_id_a1, :ekz_start_date, :ekz_end_date, :ekz_submission_date, 1, :ekz_comment, :ekz_receive_date, :ekz_send_date)";
						$ekuz_stmt = $pdo->prepare($ekuz_sql);
						$ekuz_stmt->execute($ekuz_params);	
					}
				}
			}
			$pdo->commit();
		} catch (Exception $e){
				throw $e;
				$pdo->rollback();
				die;
		}
		echo 'Ilość pętli: ' . $i . ' Updated: ' . $updated . ' Inserted: ' . $inserted . ' rozpocnanycj: ' . $rozpoznanych;
	}else{
		echo json_encode(
				array(
					"success" => False,
					"message" => "No i dupa",
					"url" => ''
				)
			);
	}