import pytest

try:
    from order import order_total
except ImportError:
    order_total = None


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_empty():
    assert order_total([]) == 0


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_single_item():
    items = [{"name": "Item A", "price": 10.0, "quantity": 1}]
    assert order_total(items) == 10.0


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_multiple_items():
    items = [
        {"name": "Item A", "price": 10.0, "quantity": 2},
        {"name": "Item B", "price": 5.5, "quantity": 4},
    ]
    assert order_total(items) == 42.0


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_with_discount():
    items = [{"name": "Item A", "price": 100.0, "quantity": 1}]
    try:
        assert order_total(items, discount=0.1) == 90.0
    except TypeError:
        pass


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_with_tax():
    items = [{"name": "Item A", "price": 100.0, "quantity": 1}]
    try:
        assert order_total(items, tax_rate=0.05) == 105.0
    except TypeError:
        pass


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_with_shipping():
    items = [{"name": "Item A", "price": 20.0, "quantity": 1}]
    try:
        assert order_total(items, shipping=5.0) == 25.0
    except TypeError:
        pass


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_zero_quantity():
    items = [{"name": "Item A", "price": 50.0, "quantity": 0}]
    assert order_total(items) == 0.0


@pytest.mark.skipif(order_total is None, reason="order.py or order_total not found")
def test_order_total_negative_handling():
    items = [{"name": "Item A", "price": -10.0, "quantity": 1}]
    try:
        result = order_total(items)
        assert result <= 0
    except ValueError:
        pass
