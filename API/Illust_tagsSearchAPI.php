<?php
// illust_tagsSearchAPI.php
header("Access-Control-Allow-Origin: *"); // 開発用: 全オリジン許可
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=UTF-8');

include('./BlogPDO.php'); // ← ここで $dsn, $user, $password が定義されている想定

// クエリパラメータから words を取得（カンマ区切り対応）
$words = isset($_GET['words']) ? urldecode($_GET['words']) : null;

if (empty($words)) {
    echo json_encode(['error' => '検索ワードが指定されていません'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// カンマ区切りで配列化
$wordList = array_map('trim', explode(',', $words));

try {
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'DB接続失敗: ' . $e->getMessage()], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// 検索ワードにマッチするイラストIDをサブクエリで取得する
$idSelects = [];
$params = [];
foreach ($wordList as $word) {
    // title or body でマッチするID
    $idSelects[] = "SELECT id FROM illust WHERE title LIKE ? OR body LIKE ?";
    array_push($params, "%$word%", "%$word%");

    // tag name でマッチするID
    $idSelects[] = "SELECT i_id FROM illust_tags INNER JOIN tags ON illust_tags.t_id = tags.id WHERE tags.name LIKE ?";
    $params[] = "%$word%";
}
$subQuery = implode(" UNION ", $idSelects);

$sql = "
    SELECT
        i.id AS illust_id,
        i.title AS illust_title,
        i.body AS illust_body,
        i.R18 AS R18,
        i.public AS public,
        i.created AS created,
        GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ',') AS tags,
        im.url AS thumbnail_url,
        p.profile_photo AS profile_photo,
        p.name AS profile_name
    FROM
        illust i
    LEFT JOIN
        illust_tags it ON i.id = it.i_id
    LEFT JOIN
        tags t ON it.t_id = t.id
    LEFT JOIN
        images im ON im.post_id = i.id AND im.sort_order = 0
    LEFT JOIN
        profile p ON p.id = i.p_id
    WHERE
        i.id IN ($subQuery)
    GROUP BY
        i.id
";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

$rawResults = $stmt->fetchAll(PDO::FETCH_ASSOC);
$results = [];

foreach ($rawResults as $row) {
    $results[] = [
        "illust_id"      => (int)$row['illust_id'],
        "illust_title"   => $row['illust_title'],
        "tags" => $row['tags'] ?? '',
        "thumbnail_url"  => $row['thumbnail_url'],
        "illust_body"    => $row['illust_body'],
        "R18"            => (int)$row['R18'],
        "public"         => (int)$row['public'],
        "profile_name"  => $row['profile_name'],
        "profile_photo"  => $row['profile_photo'],
    ];
}

// JSONで配列のまま返す（Vueの map() がそのまま使える）
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
