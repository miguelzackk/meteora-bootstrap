<?php
include 'database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id_produto = $data['id_produto'] ?? '';
    $quantidade = $data['quantidade'] ?? 0;
    
    try {
        // Buscar estoque atual
        $stmt = $pdo->prepare("SELECT estoque FROM tbl_produto WHERE id_produto = ?");
        $stmt->execute([$id_produto]);
        $produto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$produto) {
            echo json_encode(['error' => 'Produto não encontrado']);
            exit;
        }
        
        $novoEstoque = $produto['estoque'] - $quantidade;
        
        if ($novoEstoque < 0) {
            echo json_encode(['error' => 'Estoque insuficiente']);
            exit;
        }
        
        // Atualizar estoque
        $stmt = $pdo->prepare("UPDATE tbl_produto SET estoque = ? WHERE id_produto = ?");
        $stmt->execute([$novoEstoque, $id_produto]);
        
        echo json_encode(['success' => true, 'novo_estoque' => $novoEstoque]);
        
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Erro ao atualizar estoque: ' . $e->getMessage()]);
    }
}
?>